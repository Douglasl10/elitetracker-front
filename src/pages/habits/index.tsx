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
  const token = localStorage.getItem('token');
  const [habits, setHabits] = useState<Habit[]>([]);

  const [displayedMonth, setDisplayedMonth] = useState<Date>(dayjs().startOf('month').toDate());
  const today = dayjs().startOf('day');

  const metrisInfo = useMemo(() => {
    const numberOfMonthsDays = dayjs(displayedMonth).endOf('month').date();
    const numberOfDays = metrics?.completedDates?.length ? metrics.completedDates.length : 0;
    const completedDays = `${numberOfDays}/${numberOfMonthsDays}`;
    const progress = `${Math.round((numberOfDays / numberOfMonthsDays) * 100)}%`;
    return { completedDays, progress };
  }, [metrics, displayedMonth]);

  async function handleSelectHabit(habit: Habit, currentMonth?: Date) {
    setSelectedHabit(habit);
    const monthToRequest = currentMonth ? dayjs(currentMonth).startOf('month') : dayjs(displayedMonth).startOf('month');


    const { data } = await api.get<Habitsmetrics>(`/habits/${habit._id}/metrics`, {
      params: {
        date: monthToRequest.toISOString()
      }
    });

    setMetrics(data);
  }

  async function loadHabits() {
    const { data } = await api.get<Habit[]>('/habits');
    setHabits(data);
  }

  async function handleSubimit() {
    const name = nameInput.current?.value;
    if (name) {
      await api.post('/habits', { name }, { headers: { Authorization: `Bearer ${token}` } });
      if (nameInput.current) nameInput.current.value = '';
      await loadHabits();
    }
  }

  useEffect(() => {
    loadHabits();
  }, []);

  async function handleDelete(id: string) {
    await api.delete(`/habits/${id}`);
    setHabits(habits.filter(habit => habit._id !== id));
    setMetrics({} as Habitsmetrics);
    setSelectedHabit(null);
  }

  async function handleToggle(habit: Habit) {
    await api.patch(`/habits/${habit._id}/toggle`);
    await loadHabits();

    await handleSelectHabit(habit, displayedMonth);
  }


  async function handleSelectMonth(date: DateStringValue) {
    if (!date) return;
    const monthDate = new Date(date);
    setDisplayedMonth(monthDate);

    if (selectedHabit) {
      await handleSelectHabit(selectedHabit, monthDate);
    }
  }

  const todayKey = today.format('YYYY-MM-DD');

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Header title="Habitos Diarios" />
        <div className={styles.input}>
          <input type="text" placeholder="Adicione um novo hábito" ref={nameInput} />
          <PaperPlaneRightIcon size={24} onClick={handleSubimit} />
        </div>

        <div className={styles.tasks}>
          {habits.map(habit => (
            <div className={clsx(styles.task, habit._id === selectedHabit?._id && styles['task-active'])} key={habit._id}>
              <p onClick={() => handleSelectHabit(habit, displayedMonth)}>{habit.name}</p>
              <div>
                <input
                  type="checkbox"
                  size={24}
                  className={styles.sucess}
                  checked={habit.completedDates.some((date: string) =>
                    dayjs(date).format('YYYY-MM-DD') === todayKey
                  )}
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
