// ============================================
// AgentOffice - 3D Task Board
// ============================================
import { Text, RoundedBox } from '@react-three/drei';
import { useAppStore } from '../../store/useAppStore';

interface TaskBoard3DProps {
  position: [number, number, number];
}

const COLUMN_COLORS: Record<string, string> = {
  'todo': '#64748b',
  'in-progress': '#eab308',
  'review': '#3b82f6',
  'done': '#22c55e',
};

const COLUMN_LABELS = ['To Do', 'In Progress', 'Review', 'Done'];
const COLUMN_KEYS = ['todo', 'in-progress', 'review', 'done'];

export function TaskBoard3D({ position }: TaskBoard3DProps) {
  const tasks = useAppStore((s) => s.tasks);

  return (
    <group position={position}>
      {/* Board background */}
      <RoundedBox args={[8, 3, 0.08]} radius={0.04}>
        <meshStandardMaterial
          color="#0f0f28"
          metalness={0.5}
          roughness={0.4}
          emissive="#6366f1"
          emissiveIntensity={0.02}
        />
      </RoundedBox>

      {/* Board border glow */}
      <mesh position={[0, 0, 0.05]}>
        <planeGeometry args={[8.05, 3.05]} />
        <meshBasicMaterial color="#6366f1" transparent opacity={0.1} />
      </mesh>

      {/* Title */}
      <Text
        position={[0, 1.7, 0.05]}
        fontSize={0.18}
        color="#818cf8"
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        📋 TASK BOARD
      </Text>

      {/* Columns */}
      {COLUMN_KEYS.map((key, colIdx) => {
        const xOffset = -3 + colIdx * 2;
        const columnTasks = tasks.filter((t) => t.status === key);

        return (
          <group key={key} position={[xOffset, 0, 0.05]}>
            {/* Column header */}
            <RoundedBox args={[1.8, 0.3, 0.02]} radius={0.04} position={[0, 1.2, 0]}>
              <meshStandardMaterial
                color={COLUMN_COLORS[key]}
                transparent
                opacity={0.2}
                emissive={COLUMN_COLORS[key]}
                emissiveIntensity={0.3}
              />
            </RoundedBox>
            <Text
              position={[0, 1.2, 0.02]}
              fontSize={0.1}
              color={COLUMN_COLORS[key]}
              anchorX="center"
              anchorY="middle"
            >
              {COLUMN_LABELS[colIdx]}
            </Text>

            {/* Task count */}
            <Text
              position={[0.75, 1.2, 0.02]}
              fontSize={0.08}
              color={COLUMN_COLORS[key]}
              anchorX="center"
              anchorY="middle"
            >
              {`${columnTasks.length}`}
            </Text>

            {/* Task cards */}
            {columnTasks.slice(0, 4).map((task, taskIdx) => (
              <group key={task.id} position={[0, 0.7 - taskIdx * 0.5, 0]}>
                <RoundedBox args={[1.7, 0.4, 0.02]} radius={0.03}>
                  <meshStandardMaterial
                    color="#1a1a3a"
                    metalness={0.3}
                    roughness={0.6}
                  />
                </RoundedBox>
                <Text
                  position={[0, 0, 0.02]}
                  fontSize={0.07}
                  color="#e2e8f0"
                  anchorX="center"
                  anchorY="middle"
                  maxWidth={1.5}
                >
                  {task.title.length > 25 ? task.title.substring(0, 25) + '...' : task.title}
                </Text>
              </group>
            ))}

            {/* Divider */}
            {colIdx < 3 && (
              <mesh position={[1, 0, 0]}>
                <planeGeometry args={[0.005, 2.5]} />
                <meshBasicMaterial color="#2a2a55" transparent opacity={0.5} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}
