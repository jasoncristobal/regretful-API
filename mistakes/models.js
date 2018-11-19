'use strict';
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const MistakeSchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    required: true
  },
  question1: {
    type: String,
    required: true
  },
  question2: {
    type: String,
    required: true
  },
  question3: {
    type: String,
    required: true
  },
  comments: [{
    comment: String,
    date: Date
    }],
  commentsLength: {
    type: Number
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: false, required: [false, 'No user id found'] },
});

MistakeSchema.methods.serialize = function () {
  return {
    user: this.user,
    id: this._id,
    title: this.title,
    description: this.description,
    question1: this.question1,
    question2: this.question2,
    question3: this.question3,
    comments: this.comments
  };
};

const Mistake = mongoose.model('Mistake', MistakeSchema);

module.exports = { Mistake };
