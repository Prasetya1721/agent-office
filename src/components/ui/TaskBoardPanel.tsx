// ============================================
// AgentOffice - Task Board Panel (Kanban)
// ============================================
import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import type { Task, TaskStatus } from '../../types';
import './TaskBoardPanel.css';

const COLUMNS: { key: TaskStatus; label: string; icon: string; color: string }[] = [
  { key: 'todo', label: 'To Do', icon: '📋', color: '#64748b' },
  { key: 'in-progress', label: 'In Progress', icon: '⚡', color: '#eab308' },
  { key: 'review', label: 'Review', icon: '👀', color: '#3b82f6' },
  { key: 'done', label: 'Done', icon: '✅', color: '#22c55e' },
];

export function TaskBoardPanel() {
  const tasks = useAppStore((s) => s.tasks);
  const agents = useAppStore((s) => s.agents);
  const addTask = useAppStore((s) => s.addTask);
  const moveTask = useAppStore((s) => s.moveTask);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [draggedTask, setDraggedTask] = useState<string | null>(null);

  const handleAddTask = () => {
    if (!newTitle.trim()) return;
    const task: Task = {
      id: `task-${Date.now()}`,
      title: newTitle.trim(),
      description: newDesc.trim(),
      status: 'todo',
      subtaskIds: [],
      artifacts: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    addTask(task);
    setNewTitle('');
    setNewDesc('');
    setShowAddForm(false);
  };

  const handleDragStart = (taskId: string) => {
    setDraggedTask(taskId);
  };

  const handleDrop = (status: TaskStatus) => {
    if (draggedTask) {
      moveTask(draggedTask, status);
      setDraggedTask(null);
    }
  };

  return (
    <div className="taskboard-panel">
      <div className="taskboard-header">
        <h2>📋 Task Board</h2>
        <button className="taskboard-add-btn" onClick={() => setShowAddForm(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Tambah Tugas
        </button>
      </div>

      {/* Add task form */}
      {showAddForm && (
        <div className="taskboard-add-form">
          <input
            type="text"
            placeholder="Judul tugas..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="taskboard-input"
            autoFocus
          />
          <textarea
            placeholder="Deskripsi (opsional)..."
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            className="taskboard-textarea"
            rows={2}
          />
          <div className="taskboard-form-actions">
            <button className="taskboard-form-btn primary" onClick={handleAddTask}>
              Tambah
            </button>
            <button className="taskboard-form-btn" onClick={() => setShowAddForm(false)}>
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Kanban columns */}
      <div className="taskboard-columns">
        {COLUMNS.map((col) => {
          const columnTasks = tasks.filter((t) => t.status === col.key);
          return (
            <div
              key={col.key}
              className={`taskboard-column ${draggedTask ? 'droppable' : ''}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(col.key)}
            >
              <div className="taskboard-column-header" style={{ '--col-color': col.color } as React.CSSProperties}>
                <span className="taskboard-column-icon">{col.icon}</span>
                <span className="taskboard-column-label">{col.label}</span>
                <span className="taskboard-column-count">{columnTasks.length}</span>
              </div>

              <div className="taskboard-column-cards">
                {columnTasks.map((task) => {
                  const assignedAgent = agents.find((a) => a.id === task.assignedAgentId);
                  return (
                    <div
                      key={task.id}
                      className="taskboard-card"
                      draggable
                      onDragStart={() => handleDragStart(task.id)}
                    >
                      <h4 className="taskboard-card-title">{task.title}</h4>
                      {task.description && (
                        <p className="taskboard-card-desc">{task.description}</p>
                      )}
                      <div className="taskboard-card-footer">
                        {assignedAgent && (
                          <span
                            className="taskboard-card-agent"
                            style={{ color: assignedAgent.color }}
                          >
                            {assignedAgent.avatar.icon} {assignedAgent.name}
                          </span>
                        )}
                        <span className="taskboard-card-time">
                          {new Date(task.updatedAt).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {columnTasks.length === 0 && (
                  <div className="taskboard-empty">
                    Belum ada tugas
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
