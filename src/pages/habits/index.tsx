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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completionTimestamps, setCompletionTimestamps] = useState<Record<string, number>>({});
  const [hiddenHabitIds, setHiddenHabitIds] = useState<string[]>([]);

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
      // Um hábito é ocultado apenas se estiver no array de hiddenHabitIds
      return !hiddenHabitIds.includes(habit._id);
    });
  }, [habits, hiddenHabitIds]);

  // Efeito para gerenciar o timer de 10 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const tenMinutesInMs = 10 * 60 * 1000;
      
      const newHiddenIds: string[] = [];
      
      Object.entries(completionTimestamps).forEach(([id, timestamp]) => {
        if (now - timestamp >= tenMinutesInMs) {
          newHiddenIds.push(id);
        }
      });

      if (newHiddenIds.length > 0) {
        setHiddenHabitIds(prev => {
          const combined = [...new Set([...prev, ...newHiddenIds])];
          return combined;
        });
      }
    }, 5000); // Checa a cada 5 segundos

    return () => clearInterval(interval);
  }, [completionTimestamps]);

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

      // Seleciona o primeiro hábito automaticamente se nenhum estiver selecionado
      if (data.length > 0 && !selectedHabit) {
        handleSelectHabit(data[0]);
      } else if (selectedHabit) {
        // Atualiza os dados do hábito selecionado se ele ainda existir
        const current = data.find(h => h._id === selectedHabit._id);
        if (current) {
          handleSelectHabit(current);
        }
      }

      return data;
    } catch (error) {
      console.error("Erro ao carregar hábitos:", error);
    }
  }

  async function handleSubimit() {
    if (isSubmitting) return;

    const name = nameInput.current?.value?.trim();
    
    if (name) {
      // Verifica se o hábito já existe localmente (independente de estar concluído hoje ou não)
      const habitAlreadyExists = habits.find(h => h.name.toLowerCase() === name.toLowerCase());
      
      if (habitAlreadyExists) {
        const isCompletedToday = habitAlreadyExists.completedDates.some(date => dayjs(date).format('YYYY-MM-DD') === todayKey);
        
        if (isCompletedToday) {
          alert(`O hábito "${name}" já foi concluído hoje e está oculto.`);
        } else {
          alert(`O hábito "${name}" já está na sua lista.`);
          handleSelectHabit(habitAlreadyExists);
        }
        
        if (nameInput.current) nameInput.current.value = '';
        return;
      }

      setIsSubmitting(true);
      try {
        const response = await api.post('/habits', { name });
        console.log("Hábito criado com sucesso:", response.data);
        
        if (nameInput.current) nameInput.current.value = '';
        await loadHabits();
      } catch (error: any) {
        console.error("Erro detalhado ao criar hábito:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          payload: { name }
        });
        
        const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Erro desconhecido';
        alert(`Erro ao criar hábito: ${errorMessage}`);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      alert("Por favor, digite o nome do hábito.");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
        handleSubimit();
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
    
    // Inicia animação visual
    setCompletingHabitId(habit._id);

    // Se estiver marcando como concluído, registra o timestamp para sumir em 10 min
    if (!isCompleted) {
      setCompletionTimestamps(prev => ({
        ...prev,
        [habit._id]: Date.now()
      }));
    } else {
      // Se estiver DESMARCANDO, remove dos timestamps e da lista de ocultos
      setCompletionTimestamps(prev => {
        const newState = { ...prev };
        delete newState[habit._id];
        return newState;
      });
      setHiddenHabitIds(prev => prev.filter(id => id !== habit._id));
    }

    // Pequeno delay para a animação do checkbox antes de disparar a API
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
    }, 300); 
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
          <input 
            type="text" 
            placeholder="Adicione um novo hábito" 
            ref={nameInput} 
            onKeyDown={handleKeyDown}
          />
          <PaperPlaneRightIcon 
            size={24} 
            onClick={handleSubimit} 
            style={{ opacity: isSubmitting ? 0.5 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
          />
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
                  checked={habit.completedDates.some(date => dayjs(date).format('YYYY-MM-DD') === todayKey) || habit._id === completingHabitId}
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
