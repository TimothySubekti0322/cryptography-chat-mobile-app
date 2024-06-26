const express = require("express");
const router = express.Router();

const firebaseAdmin = require("../fire");
const db = firebaseAdmin.firestore();

// get all user
router.get("/", async (req, res) => {
  try {
    const usersDb = db.collection("users");
    const users = await usersDb.get();
    const usersList = [];
    users.forEach((doc) => {
      const data = {
        id: doc.id,
        ...doc.data(),
      };
      usersList.push(data);
    });
    res.status(200).send({ message: "success", users: usersList, status: 200 });
  } catch (error) {
    res.status(500).send({ error });
  }
});

// get user by username
router.get("/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const usersDb = db.collection("users");
    const user = await usersDb.doc(username).get();

    if (!user.exists) {
      res.status(200).send({ message: "User not found", status: 404 });
      return;
    }

    const userData = {
      id: user.id,
      ...user.data(),
    };

    res.status(200).send({ message: "success", user: userData, status: 200 });
  } catch (error) {
    res.status(500).send({ error });
  }
});

// create user
router.post("/", async (req, res) => {
  try {
    const { username, password, e, d, n } = req.body;
    const usersDb = db.collection("users");

    // check if user already exists
    const user = await usersDb.doc(username).get();
    if (user.exists) {
      res.status(200).send({ message: "User already exists", status: 404 });
      return;
    }

    const response = await usersDb.doc(username).set({
      username,
      password,
      e,
      d,
      n,
    });
    res.status(200).send({ message: "success", status: 200 });
  } catch (error) {
    res.status(500).send({ error });
  }
});

//authenticate user

router.post("/auth", async (req, res) => {
  try {
    const { username, password } = req.body;
    const usersDb = db.collection("users");
    const user = await usersDb.doc(username).get();

    if (!user.exists) {
      res.status(200).send({ message: "User not found", status: 404 });
      return;
    }

    const userData = {
      id: user.id,
      ...user.data(),
    };

    if (userData.password !== password) {
      res.status(200).send({ message: "Invalid password", status: 404 });
      return;
    }

    res.status(200).send({ message: "success", user: userData, status: 200 });
  } catch (error) {
    res.status(500).send({ error });
  }
});

module.exports = router;
