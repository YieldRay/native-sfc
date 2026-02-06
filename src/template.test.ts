import { reactiveNodes } from "./template.ts";
import { signal } from "./signals.ts";

function example() {
  const div = Object.assign(document.createElement("div"), {
    innerHTML: /*html*/ `
    <h1>Todo List</h1>

    <div>
      <input .value="newTodo()" @input="setNewTodo(event.target.value)" :placeholder="'Add a new todo...'" />
      <button @click="addTodo()">Add</button>
    </div>

    <div>
      <label>
        <input type="checkbox" .checked="showCompleted()" @change="setShowCompleted(event.target.checked)" />
        Show completed
      </label>
    </div>

    <p>Total: {{ todos().length }}, Completed: {{ todos().filter(t => t.completed).length }}</p>

    <ul>
      <li #for="todos().filter(t => showCompleted() || !t.completed).map((todo, index) => ({ todo, index }))">
        <input
          type="checkbox"
          .checked="todo.completed"
          @change="toggleTodo(index)"
        />
        <span :style="todo.completed ? 'text-decoration: line-through' : ''">
          {{ todo.text }}
        </span>
        <button @click="removeTodo(index)">Delete</button>
      </li>
    </ul>

    <div #if="todos().length === 0">
      <p>No todos yet. Add one above!</p>
    </div>
    `,
  });
  document.body.appendChild(div);

  const setup = () => {
    const [todos, setTodos] = signal([
      { text: "Learn reactive templates", completed: false },
      { text: "Build something cool", completed: false },
    ]);
    const [newTodo, setNewTodo] = signal("");
    const [showCompleted, setShowCompleted] = signal(true);

    const addTodo = () => {
      if (newTodo().trim()) {
        setTodos([...todos(), { text: newTodo(), completed: false }]);
        setNewTodo("");
      }
    };

    const toggleTodo = (index: number) => {
      const updated = [...todos()];
      updated[index].completed = !updated[index].completed;
      setTodos(updated);
    };

    const removeTodo = (index: number) => {
      setTodos(todos().filter((_, i) => i !== index));
    };

    return {
      todos,
      setTodos,
      newTodo,
      setNewTodo,
      showCompleted,
      setShowCompleted,
      addTodo,
      toggleTodo,
      removeTodo,
    };
  };

  reactiveNodes(div.childNodes, setup());
}
