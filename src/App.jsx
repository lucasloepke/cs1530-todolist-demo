import { useState, useEffect } from 'react'

export default function App() {
  const [todos, setTodos] = useState(() => {
    try {
      const stored = localStorage.getItem('todos')
      return stored ? JSON.parse(stored) : [
        { id: 1, text: 'Read a book', done: false },
        { id: 2, text: 'Go for a walk', done: true },
        { id: 3, text: 'Write some code', done: false },
      ]
    } catch {
      return []
    }
  })
  const [input, setInput] = useState('')
  const [filter, setFilter] = useState('all')
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [blurBlock] = useState(() => ({ next: false }))

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos))
  }, [todos])

  useEffect(() => {
    if (editingId === null) return
    const el = document.getElementById('todo-inline-edit-input')
    el?.focus()
    el?.select()
  }, [editingId])

  const addTodo = () => {
    const text = input.trim()
    if (!text) return
    setTodos([...todos, { id: Date.now(), text, done: false }])
    setInput('')
  }

  const toggleTodo = (id) =>
    setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))

  const deleteTodo = (id) => {
    setTodos(todos.filter((t) => t.id !== id))
    if (editingId === id) setEditingId(null)
  }

  const startEdit = (todo) => {
    setEditingId(todo.id)
    setEditValue(todo.text)
  }

  const applyEdit = (id) => {
    const t = editValue.trim()
    if (t === '') {
      setTodos((prev) => prev.filter((x) => x.id !== id))
    } else {
      setTodos((prev) =>
        prev.map((x) => (x.id === id ? { ...x, text: t } : x)),
      )
    }
    setEditingId(null)
    setEditValue('')
  }

  const onEditBlur = (id) => {
    if (blurBlock.next) {
      blurBlock.next = false
      return
    }
    if (editingId !== id) return
    applyEdit(id)
  }

  const visible = todos.filter((t) =>
    filter === 'active' ? !t.done : filter === 'completed' ? t.done : true,
  )

  const remaining = todos.filter((t) => !t.done).length

  const tabClass = (name) =>
    `px-3 py-1 rounded-md text-sm font-medium transition ${
      filter === name
        ? 'bg-indigo-600 text-white'
        : 'text-slate-600 hover:bg-slate-200'
    }`

  return (
    <div className="min-h-screen bg-slate-100 flex items-start justify-center py-16 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">Todo List</h1>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTodo()}
            placeholder="What needs doing?"
            className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={addTodo}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition"
          >
            Add
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <button onClick={() => setFilter('all')} className={tabClass('all')}>
            All
          </button>
          <button onClick={() => setFilter('active')} className={tabClass('active')}>
            Active
          </button>
          <button onClick={() => setFilter('completed')} className={tabClass('completed')}>
            Completed
          </button>
        </div>

        <ul className="space-y-2">
          {visible.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center gap-3 px-3 py-2 rounded-md border border-slate-200 hover:bg-slate-50"
            >
              {editingId === todo.id ? (
                <input
                  id="todo-inline-edit-input"
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      blurBlock.next = true
                      applyEdit(todo.id)
                    } else if (e.key === 'Escape') {
                      e.preventDefault()
                      blurBlock.next = true
                      setEditingId(null)
                      setEditValue('')
                    }
                  }}
                  onBlur={() => onEditBlur(todo.id)}
                  className="flex-1 min-w-0 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => toggleTodo(todo.id)}
                  onDoubleClick={() => startEdit(todo)}
                  className={`flex-1 min-w-0 text-left ${
                    todo.done ? 'line-through text-slate-400' : 'text-slate-800'
                  }`}
                >
                  {todo.text}
                </button>
              )}
              <button
                onClick={() => deleteTodo(todo.id)}
                className="text-slate-400 hover:text-red-500 text-lg font-bold px-2"
                aria-label="Delete todo"
              >
                ×
              </button>
            </li>
          ))}
          {visible.length === 0 && (
            <li className="text-center text-slate-400 py-4 text-sm">
              Nothing here.
            </li>
          )}
        </ul>

        <div className="mt-4 text-sm text-slate-500">
          {remaining} {remaining === 1 ? 'item' : 'items'} left
        </div>
      </div>
    </div>
  )
}