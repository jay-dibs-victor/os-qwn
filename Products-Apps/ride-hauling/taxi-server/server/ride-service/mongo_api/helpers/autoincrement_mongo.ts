import { Model } from 'mongoose';

const AutoIncrementer = function(model: Model<any>) {
  let countIds: number = 0;
  model.find()
    .estimatedDocumentCount()
    .exec()
    .then(count => {
      countIds = count;
      console.log(count + ' is the number of doc');
    })
    .catch(e => console.log(e));
  
  let countId = Number(countIds) || 5;
  
  function increase() {
    return countId++;
  }

  return {
    counter: increase,
  };
};

export default AutoIncrementer;
