'use strict';
const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');

const { Mistake } = require('./models');

const router = express.Router();

const jsonParser = bodyParser.json();
const jwtAuth = passport.authenticate('jwt', { session: false });

router.use(jwtAuth);

// Get all my items
router.get('/', (req, res) => {
  console.log(req.user)
  Mistake
    .find({
      user: req.user.id
    })
    .then(mistakes => {
      res.json(mistakes.map(mistake => {
        return mistake.serialize();
      }));
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went terribly wrong' });
    });
});

// Get everyone's items and sort by newest to oldest
router.get('/recent', (req, res) => {
  console.log(req.user)
  Mistake
    .find().sort({ date: -1 })
    .then(mistakes => {
      res.json(mistakes.map(mistake => {
        return mistake.serialize();
      }));
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went terribly wrong' });
    });
});

// Get everyone's items and sort by most comments
router.get('/discussed', (req, res) => {
  console.log(req.user)
  Mistake
    .find().sort({ commentsLength: -1 })
    .then(mistakes => {
      res.json(mistakes.map(mistake => {
        return mistake.serialize();
      }));
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went terribly wrong' });
    });
});

// Get one item
router.get('/:id', (req, res) => {
  Mistake
    .findOne({
      _id: req.params.id,
      user: req.user.id
    })
    .then(mistake => {
      res.json({
        user: mistake.user,
        id: mistake._id,
        title: mistake.title,
        description: mistake.description,
        question1: mistake.question1,
        question2: mistake.question2,
        question3: mistake.question3,
        comments: mistake.comments
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went horribly awry' });
    });
});

// Post new item
router.post('/', (req, res) => {
  console.log(`xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`);
  const requiredFields = ['title', 'description', 'question1', 'question2', 'question3'];
  requiredFields.forEach(field => {
    if (!(field in req.body.newMistake)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  });

  Mistake
    .create({
      title: req.body.newMistake.title,
      description: req.body.newMistake.description,
      question1: req.body.newMistake.question1,
      question2: req.body.newMistake.question2,
      question3: req.body.newMistake.question3,
      user: req.user.id
    })
    .then(mistake => res.status(201).json(
      mistake.serialize()
    ))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Something went wrong' });
    });
});

// Post new comment
router.post('/comment/:id', (req, res) => {
  console.log(req.body);
  const requiredFields = ['comments'];
  requiredFields.forEach(field => {
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  });

  Mistake
    .findOneAndUpdate(
      { _id: req.params.id },
      {
        $push: {
          comments:
            { comments: req.body.comments }
        }
      })
    .then(mistake => res.status(201).json(
      mistake.serialize()
    ))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Something went wrong' });
    });
});

router.put('/:id', (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    res.status(400).json({
      error: 'Request path id and request body id values must match'
    });
  }

  const updated = {};
  const updateableFields = ['title', 'description', 'question1', 'question2', 'question3'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  Mistake
    .findOneAndUpdate({
      _id: req.params.id,
      user: req.user.id
    },
      { $set: updated },
      { new: true })
    .then(updatedMistake => res.status(200).json({
      id: updatedMistake.id,
      title: updatedMistake.title,
      description: updatedMistake.description,
      question1: updatedMistake.question1,
      question2: updatedMistake.question2,
      question3: updatedMistake.question3
    }))
    .catch(err => res.status(500).json({ message: err }));
});


router.delete('/:id', (req, res) => {
  console.log(`check if ID exists` + req.params.id)
  Mistake
    .findOneAndRemove({
      _id: req.params.id,
      user: req.user.id
    })
    .then(() => {
      console.log(`Deleted mistake with id \`${req.params.id}\``);
      res.status(204).end();
    });
});


module.exports = { router };
