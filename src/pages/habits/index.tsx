import { PaperPlaneRightIcon, TrashIcon } from "@phosphor-icons/react";
import styles from './styles.module.css';
import { useEffect, useMemo, useRef, useState } from "react";
import api from "../../services/api";
import dayjs from 'dayjs';
import { Header } from "../../components/hedear";
import { Info } from "../../components/info";
import { Calendar, type DateStringValue } from "@mantine/dates";
import clsx from "clsx";
import { Indicator } from "@mantine/core";

type Habit = {
  _id: string;
  name: string;
  completedDates: string[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

type Habitsmetrics = {
  _id: string;
  name: string;
  completedDates: string[];
}

const Habits = () => {
  const [metrics, setMetrics] = useState<Habitsmetrics>({} as Habitsmetrics);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const nameInput = useRef<HTMLInputElement>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completingHabitId, setCompletingHabitId] = useState<string | null>(null);

  const [displayedMonth, setDisplayedMonth] = useState<Date>(dayjs().startOf('month').toDate());
  const today = dayjs().startOf('day');
  const todayKey = today.format('YYYY-MM-DD');

  const metrisInfo = useMemo(() => {
    const numberOfMonthsDays = dayjs(displayedMonth).endOf('month').date();
    const numberOfDays = metrics?.completedDates?.length ? metrics.completedDates.length : 0;
    const completedDays = `${numberOfDays}/${numberOfMonthsDays}`;
    const progress = `${Math.round((numberOfDays / numberOfMonthsDays) * 100)}%`;
    return { completedDays, progress };
  }, [metrics, displayedMonth]);

  const habitsToDisplay = useMemo(() => {
    return habits.filter(habit => {
      const isDoneToday = habit.completedDates.some(date => dayjs(date).format('YYYY-MM-DD') === todayKey);
      // Se o hábito estiver em processo de conclusão, ainda mostramos para a animação rodar
      return !isDoneToday || habit._id === completingHabitId;
    });
  }, [habits, todayKey, completingHabitId]);

  async function handleSelectHabit(habit: Habit, currentMonth?: Date) {
    setSelectedHabit(habit);
    const monthToRequest = currentMonth ? dayjs(currentMonth).startOf('month') : dayjs(displayedMonth).startOf('month');

    try {
      const { data } = await api.get<Habitsmetrics>(`/habits/${habit._id}/metrics`, {
        params: {
          date: monthToRequest.toISOString()
        }
      });
      setMetrics(data);
    } catch (error) {
      console.error("Erro ao carregar métricas:", error);
    }
  }

  async function loadHabits() {
    try {
      const { data } = await api.get<Habit[]>('/habits');
      setHabits(data);
      return data;
    } catch (error) {
      console.error("Erro ao carregar hábitos:", error);
    }
  }

  async function handleSubimit() {
    const name = nameInput.current?.value;
    if (name) {
      try {
        await api.post('/habits', { name });
        if (nameInput.current) nameInput.current.value = '';
        await loadHabits();
      } catch (error) {
        console.error("Erro ao criar hábito:", error);
      }
    }
  }

  useEffect(() => {
    loadHabits();
  }, []);

  async function handleDelete(id: string) {
    try {
      await api.delete(`/habits/${id}`);
      setHabits(habits.filter(habit => habit._id !== id));
      setMetrics({} as Habitsmetrics);
      setSelectedHabit(null);
    } catch (error) {
      console.error("Erro ao deletar hábito:", error);
    }
  }

  async function handleToggle(habit: Habit) {
    const isCompleted = habit.completedDates.some(date => dayjs(date).format('YYYY-MM-DD') === todayKey);
    
    // Se estiver marcando como concluído, inicia animação
    if (!isCompleted) {
      setCompletingHabitId(habit._id);
    }

    // Aguarda a animação visual antes de disparar a lógica (opcional, mas melhora UX)
    setTimeout(async () => {
      try {
        await api.patch(`/habits/${habit._id}/toggle`);
        const refreshedHabits = await loadHabits();
        
        const updatedHabit = refreshedHabits?.find(h => h._id === habit._id);
        if (updatedHabit && selectedHabit?._id === habit._id) {
          await handleSelectHabit(updatedHabit, displayedMonth);
        }
      } catch (error) {
        console.error("Erro ao alternar hábito:", error);
        loadHabits();
      } finally {
        setCompletingHabitId(null);
      }
    }, 600); // Tempo da animação CSS
  }

  async function handleSelectMonth(date: DateStringValue) {
    if (!date) return;
    const monthDate = new Date(date);
    setDisplayedMonth(monthDate);

    if (selectedHabit) {
      await handleSelectHabit(selectedHabit, monthDate);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Header title="Habitos Diarios" />
        <div className={styles.input}>
          <input type="text" placeholder="Adicione um novo hábito" ref={nameInput} />
          <PaperPlaneRightIcon size={24} onClick={handleSubimit} />
        </div>

        <div className={styles.tasks}>
          {habitsToDisplay.map(habit => (
            <div 
              className={clsx(
                styles.task, 
                habit._id === selectedHabit?._id && styles['task-active'],
                habit._id === completingHabitId && styles.completing
              )} 
              key={habit._id}
            >
              <p onClick={() => handleSelectHabit(habit, displayedMonth)}>{habit.name}</p>
              <div>
                <input
                  type="checkbox"
                  size={24}
                  className={styles.sucess}
                  checked={habit._id === completingHabitId}
                  onChange={() => handleToggle(habit)}
                />
                <TrashIcon size={24} className={styles.apagar} onClick={() => handleDelete(habit._id)} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedHabit && (
        <div className={styles.metrics}>
          <h2>{selectedHabit.name}</h2>

          <div className={styles['info-container']}>
            <Info value={metrisInfo.completedDays} label="Dias concluidos" />
            <Info value={metrisInfo.progress} label="porcentagem" />
          </div>

          <div className={styles.calendar}>
            <Calendar
              static
              onMonthSelect={handleSelectMonth}
              onNextMonth={handleSelectMonth}
              onPreviousMonth={handleSelectMonth}
              renderDay={(date) => {
                const dayNumber = dayjs(date).date();
                const dateKey = dayjs(date).format('YYYY-MM-DD');
                const isSameDate = metrics?.completedDates?.some((item) =>
                  dayjs(item).format('YYYY-MM-DD') === dateKey
                );

                return (
                  <Indicator
                    size={10}
                    color="var(--info)"
                    offset={-2}
                    disabled={!isSameDate}
                  >
                    <div>{dayNumber}</div>
                  </Indicator>
                );
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Habits;
