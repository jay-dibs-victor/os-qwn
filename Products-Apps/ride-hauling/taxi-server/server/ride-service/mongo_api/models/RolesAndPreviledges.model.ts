import mongoose, { Document, Schema } from 'mongoose';

export interface IRolesAndPreviledges extends Document {
  id: number;
  for_admins: boolean;
  previledges_info: string;
  previledges_description: string;
  status: string;
  view_transactions: string;
  view_quotations: string;
  view_cars: string;
  view_drivers: string;
  view_partners: string;
  view_sos: string;
  view_package: string;
  view_bookings: string;
  view_tickets: string;
  view_faqs: string;
  view_settings: string;
  view_users: string;
  view_admins: string;
  view_car_inspection: string;
  view_drive_test: string;
  manage_payments: string;
  manage_transactions: string;
  manage_quotations: string;
  manage_cars: string;
  manage_drivers: string;
  manage_partners: string;
  manage_sos: string;
  manage_package: string;
  manage_bookings: string;
  manage_tickets: string;
  manage_faqs: string;
  manage_settings: string;
  manage_users: string;
  manage_admins: string;
  manage_car_inspection: string;
  manage_drive_test: string;
  created_at: Date;
  updated_at: Date;
  usergroup_set: any[];
}

const RolesAndPreviledgesSchema = new Schema<IRolesAndPreviledges>(
  {
    id: { type: Number, default: 0 },
    for_admins: { type: Boolean, default: true },
    previledges_info: { type: String },
    previledges_description: { type: String },
    status: {
      type: String,
      enum: ['Active', 'Dormant', 'Disabled', 'Suspended'],
      default: 'Active',
    },
    view_transactions: { type: String, default: 'yes' },
    view_quotations: { type: String, default: 'yes' },
    view_cars: { type: String, default: 'yes' },
    view_drivers: { type: String, default: 'yes' },
    view_partners: { type: String, default: 'yes' },
    view_sos: { type: String, default: 'yes' },
    view_package: { type: String, default: 'yes' },
    view_bookings: { type: String, default: 'yes' },
    view_tickets: { type: String, default: 'yes' },
    view_faqs: { type: String, default: 'yes' },
    view_settings: { type: String, default: 'yes' },
    view_users: { type: String, default: 'yes' },
    view_admins: { type: String, default: 'yes' },
    view_car_inspection: { type: String, default: 'yes' },
    view_drive_test: { type: String, default: 'yes' },
    manage_payments: { type: String, default: 'yes' },
    manage_transactions: { type: String, default: 'yes' },
    manage_quotations: { type: String, default: 'yes' },
    manage_cars: { type: String, default: 'yes' },
    manage_drivers: { type: String, default: 'yes' },
    manage_partners: { type: String, default: 'yes' },
    manage_sos: { type: String, default: 'yes' },
    manage_package: { type: String, default: 'yes' },
    manage_bookings: { type: String, default: 'yes' },
    manage_tickets: { type: String, default: 'yes' },
    manage_faqs: { type: String, default: 'yes' },
    manage_settings: { type: String, default: 'yes' },
    manage_users: { type: String, default: 'yes' },
    manage_admins: { type: String, default: 'yes' },
    manage_car_inspection: { type: String, default: 'yes' },
    manage_drive_test: { type: String, default: 'yes' },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    usergroup_set: {
      type: [String],
      default: [
        'user', 'simple_admin', 'super_admin',
        'Simple Admin', 'Moderator Admin', 'Super Admin',
        'Inspection Manager', 'Partners Manager', 'Hr', 'Accountant',
      ],
    },
  },
  {
    collection: 'admin_rolesmn_previledges_collections',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

RolesAndPreviledgesSchema.set('toJSON', { getters: true, virtuals: true });

RolesAndPreviledgesSchema.statics = {
  addRole(user: any, callback: Function) {
    return this.create(user, callback);
  },
};

export default (mongoose.models.RolesAndPreviledgesModel || mongoose.model<IRolesAndPreviledges>('RolesAndPreviledgesModel', RolesAndPreviledgesSchema)) as import("mongoose").Model<any>;
