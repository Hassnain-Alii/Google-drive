db = db.getSiblingDB("Google-drive-clone");

db.users.insertMany([
  {
    name: "demo",
    email: "demo@gmail.com",
    password: "$2b$10$FtSfonhQSqyCXVbIOqASK.MuMRyTmyIZs0HO10/AcqvC3.y6r4FMC",
    createdAt: new Date(),
  },
  {
    name: "abc",
    email: "abc@gmail.com",
    password: "$2b$10$TPeU.83kXjmijogwjmPzeu4WDrWCw1xy.U8DwG4mmJsck37NSNJ0W",
    createdAt: new Date(),
  },
  {
    name: "Alice",
    email: "alice@gmail.com",
    password: "$2b$10$nd8KMRee2RBrQ0HCZz18BuwfTitZwTRparvbH/9Chu3v1J0AQxD.6",
    createdAt: new Date(),
  },
  {
    name: "Bob",
    email: "bob@gmail.com",
    password: "$2b$10$SAdkeOimGbwzo4Cx2hVWG.h0Q4VZmBI.jpL9oIlShEDnWpBgTI3Ha",
    createdAt: new Date(),
  },
]);

db.files.createIndex({ owner: 1, parentId: 1, name: 1 });

print("✅ Demo data & indexes inserted");
