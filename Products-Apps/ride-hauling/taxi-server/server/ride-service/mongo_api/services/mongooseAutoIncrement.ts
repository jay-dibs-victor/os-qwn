import mongoose, { Connection, Schema, Model } from 'mongoose';

let counterSchema: Schema;
let IdentityCounter: Model<any>;

// Initialize plugin by creating counter collection in database.
export const initialize = function(connection: Connection) {
  try {
    IdentityCounter = connection.model('IdentityCounter');
  } catch (ex: any) {
    if (ex.name === 'MissingSchemaError') {
      // Create new counter schema.
      counterSchema = new mongoose.Schema({
        model: { type: String, required: true },
        field: { type: String, required: true },
        count: { type: Number, default: 0 },
      });

      // Create model using new schema.
      IdentityCounter = connection.model('IdentityCounter', counterSchema);
    } else throw ex;
  }
};

// The function to use when invoking the plugin on a custom schema.
export const plugin = function(schema: Schema, options: any) {
  // If we don't have reference to the counterSchema or the IdentityCounter model then the plugin was most likely not
  // initialized properly so throw an error.
  if (!IdentityCounter)
    throw new Error('mongoose-auto-increment has not been initialized');

  // Default settings and plugin scope variables.
  const settings = {
    model: null as string | null, // The model to configure the plugin for.
    field: '_id', // The field the plugin should track.
    startAt: 0, // The number the count should start at.
    incrementBy: 1, // The number by which to increment the count each time.
    unique: true, // Should we create a unique index for the field
  };
  let ready = false; // True if the counter collection has been updated and the document is ready to be saved.

  switch (typeof options) {
    // If string, the user chose to pass in just the model name.
    case 'string':
      settings.model = options;
      break;
    // If object, the user passed in a hash of options.
    case 'object':
      Object.assign(settings, options);
      break;
  }

  if (settings.model == null) throw new Error('model must be set');

  // Add properties for field in schema.
  const fields: any = {};
  fields[settings.field] = {
    type: Number,
    required: true,
  };
  if (settings.field !== '_id') fields[settings.field].unique = settings.unique;
  schema.add(fields);

  // Find the counter for this model and the relevant field.
  IdentityCounter.findOne({ model: settings.model, field: settings.field }, (err: any, counter: any) => {
    if (!counter) {
      // If no counter exists then create one and save it.
      counter = new IdentityCounter({
        model: settings.model,
        field: settings.field,
        count: settings.startAt - settings.incrementBy,
      });
      counter.save(() => {
        ready = true;
      });
    } else {
      ready = true;
    }
  });

  // Declare a function to get the next counter for the model/schema.
  const nextCount = function(callback: (err: any, count?: number) => void) {
    IdentityCounter.findOne(
      {
        model: settings.model,
        field: settings.field,
      },
      (err: any, counter: any) => {
        if (err) return callback(err);
        callback(null, counter === null ? settings.startAt : counter.count + settings.incrementBy);
      },
    );
  };
  // Add nextCount as both a method on documents and a static on the schema for convenience.
  (schema as any).method('nextCount', nextCount);
  (schema as any).static('nextCount', nextCount);

  // Declare a function to reset counter at the start value - increment value.
  const resetCount = function(callback: (err: any, count?: number) => void) {
    IdentityCounter.findOneAndUpdate(
      { model: settings.model, field: settings.field },
      { count: settings.startAt - settings.incrementBy },
      { new: true }, // new: true specifies that the callback should get the updated counter.
      (err: any) => {
        if (err) return callback(err);
        callback(null, settings.startAt);
      },
    );
  };
  // Add resetCount as both a method on documents and a static on the schema for convenience.
  (schema as any).method('resetCount', resetCount);
  (schema as any).static('resetCount', resetCount);

  // Every time documents in this schema are saved, run this logic.
  schema.pre('save', function(next) {
    // Get reference to the document being saved.
    const doc: any = this;

    // Only do this if it is a new document
    if (doc.isNew) {
      // Declare self-invoking save function.
      (function save() {
        if (ready) {
          if (typeof doc[settings.field] === 'number') {
            IdentityCounter.findOneAndUpdate(
              { model: settings.model, field: settings.field, count: { $lt: doc[settings.field] } },
              { count: doc[settings.field] },
              (err: any) => {
                if (err) return next(err);
                next();
              },
            );
          } else {
            IdentityCounter.findOneAndUpdate(
              { model: settings.model, field: settings.field },
              { $inc: { count: settings.incrementBy } },
              { new: true },
              (err: any, updatedIdentityCounter: any) => {
                if (err) return next(err);
                doc[settings.field] = updatedIdentityCounter.count;
                next();
              },
            );
          }
        } else setTimeout(save, 5);
      })();
    } else next();
  });
};
