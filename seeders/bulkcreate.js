const { User, Division } = require("../models");
const bcrypt = require("bcrypt");

async function createDivision() {
  try {
    await Division.create({
      name: "ADMIN",
    });
    console.log("[DONE CREATE DIVISION]");
  } catch (error) {
    console.log(error.message);
  }
}

async function createUser() {
  const password = bcrypt.hashSync("admin", bcrypt.genSaltSync(2));

  try {
    const payload = {
      email: "admin@gmail.com",
      password: password,
      division_id: 1,
    };
    await User.create(payload);
    console.log("[DONE CREATE USER]");
  } catch (error) {
    console.log(error.message);
  }
}

async function bulkSync() {
  Promise.all([createDivision(), createUser()])
    .then((res) => {
      console.log("[OK]");
      process.exit(0);
    })
    .catch((err) => {
      console.log("[ERROR] : ", err);
      process.exit(0);
    });
}

bulkSync();
