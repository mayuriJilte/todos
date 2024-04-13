const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

app.use(express.json());

const dbPath = path.join(__dirname, "todo.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get("/", async (request, response) => {
  const getTodo = `
    SELECT * FROM todos;
  `;
  const todoList = await db.all(getTodo);
  response.send(todoList);
});

// get todos API
app.get("/todos/", async (request, response) => {
  const getTodo = `
    SELECT * FROM todos;
  `;
  const todoList = await db.all(getTodo);
  response.send(todoList);
});

//get todos API by todoId
app.get("/todos/:todosId", async (request, response) => {
  const { todosId } = request.params;

  const getTodo = `
    SELECT * FROM todos WHERE id=${todosId};
  `;
  const todo = await db.all(getTodo);
  response.send(todo);
});

// add todos API
app.post("/todos/", async (request, response) => {
  const { id, title, description, status } = request.body;
  const getTodoIdQuery = `
    INSERT INTO todos(id,title,description,status) VALUES (${id}, "${title}", "${description}", "${status}")
  `;
  await db.run(getTodoIdQuery);
  response.send("Todos Successfully Added");
});

//Delete todos API
app.delete("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  console.log(todoId);
  const getTodoIdQuery = `
    DELETE FROM todos WHERE id=${todoId};
  `;
  await db.run(getTodoIdQuery);
  response.send("Todo Deleted");
});

// Updates the details of a specific todo based on the todo ID
app.put("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  console.log(todoId);
  const requestBody = request.body;
  let updateColumn = "";
  switch (true) {
    case requestBody.title !== undefined:
      updateColumn = "Title";
      break;
    case requestBody.status !== undefined:
      updateColumn = "Status";
      break;
    case requestBody.description !== undefined:
      updateColumn = "Description";
      break;
  }
  const previousTodoQuery = `
      SELECT * FROM todos WHERE id=${todoId};
      `;
  console.log(previousTodoQuery);
  const previousTodo = await db.get(previousTodoQuery);
  console.log(previousTodo);
  const {
    title = previousTodo.title,
    description = previousTodo.description,
    status = previousTodo.status,
  } = request.body;

  const updateTodosQuery = `
    UPDATE
      todos
    SET
      title='${title}',
      description='${description}'
      status = '${status}',
      
    WHERE id=${todoId};`;
  console.log(updateTodosQuery);
  await db.run(updateTodosQuery);
  response.send(`${updateColumn} Updated`);
});
