import { MinusIcon, PlusIcon } from "@phosphor-icons/react";
import { Header } from "../../components/hedear";
import styles from "./styles.module.css";
import { useEffect, useMemo, useRef } from "react";
import Button from "../../components/button";
import { useState } from "react";
import { useTimer } from "react-timer-hook";
import dayjs from "dayjs";
import api from "../../services/api";
import { Info } from "../../components/info";
import { Calendar, type DateStringValue } from "@mantine/dates";
import { Indicator } from "@mantine/core";

type TimerType = {
    focus: number;
    rest: number;
}

type FocusMetrics = {
    _id: [number, number, number];
    count: number;
}

type FocusTime = {
    _id: string;
    timeFrom: string;
    timeTo: string;
    userId: string;
    created_at: string;
    updated_at: string;
}

type TimerState = 'PAUSED' | 'FOCUS' | 'REST';

const timerStateTitle = {
    PAUSED: 'pausado',
    FOCUS: 'foco',
    REST: 'descanso',
}

export function Focus() {
    const focusInput = useRef<HTMLInputElement>(null)
    const restInput = useRef<HTMLInputElement>(null)
    const [timers, setTimers] = useState<TimerType>({ focus: 0, rest: 0 })
    const [timerState, setTimerState] = useState<TimerState>("PAUSED")
    const [timeFrom, setTimeFrom] = useState<Date | null>(null)
    const [focusMetrics, setFocusMetrics] = useState<FocusMetrics[]>([])
    const [currentMonth, setCurrentMonth] = useState<dayjs.Dayjs>(dayjs().startOf('month'))
    const [currentDate, setCurrentDate] = useState<dayjs.Dayjs>(dayjs().startOf('day'))
    const [focusTime, setFocusTime] = useState<FocusTime[]>([])

    const metricsInfoByDay = useMemo(() => {
        const timeMetrics = focusTime.map(item => ({ timeFrom: dayjs(item.timeFrom), timeTo: dayjs(item.timeTo) }))

        let totalTimeInMinutes = 0

        if (timeMetrics.length) {
            for (const { timeFrom, timeTo } of timeMetrics) {
                const diff = timeTo.diff(timeTo, "minute")
                totalTimeInMinutes += diff
            }
        }

        return {
            timeMetrics,
            totalTimeInMinutes
        }
    }, [focusTime])

    const metricsInfoByMonth = useMemo(() => {
        const completedDates: string[] = []
        let counter: number = 0

        if (focusMetrics.length) {
            focusMetrics.forEach(item => {
                const date = dayjs(`${item._id[0] - item._id[1] - item._id[2]}`).startOf('day').toISOString()

                completedDates.push(date)
                counter+= item.count
            })
        }

        return {
            completedDates,
            counter
        }

    }, [focusMetrics])

    const focusTimer = useTimer({
        expiryTimestamp: new Date(),
        async onExpire() {
            if (timerState !== 'PAUSED') {
                await handleEnd()
            }
        }
    })

    const restTimer = useTimer({
        expiryTimestamp: new Date(),
    })

    function addSeconds(date: Date, seconds: number) {
        const time = dayjs(date).add(seconds, 'seconds')

        return time.toDate()
    }

    function handleStart() {
        restTimer.pause()

        const now = new Date()
        focusTimer.restart(addSeconds(now, timers.focus * 60))
        setTimeFrom(now)
    }

    async function handleEnd() {
        focusTimer.pause()

        await api.post('/focus-time', {
            timeFrom: timeFrom?.toISOString(),
            timeTo: new Date().toISOString()
        })

        setTimeFrom(null)
    }

    const handleAddMinutes = (type: 'focus' | 'rest') => {
        if (type === 'focus') {
            const currencyValue = Number(focusInput.current?.value)

            if (focusInput.current) {
                const value = currencyValue + 5
                focusInput.current.value = String(value)

                setTimers((old) => ({
                    ...old,
                    focus: value
                }))
            }

            return;
        }
        const currencyValue = Number(restInput.current?.value)

        if (restInput.current) {
            const value = currencyValue + 5
            restInput.current.value = String(value)

            setTimers((old) => ({
                ...old,
                rest: value
            }))
        }
    }

    const handleRemoveMinutes = (type: 'focus' | 'rest') => {
        if (type === 'focus') {
            const currencyValue = Number(focusInput.current?.value)
            if (focusInput.current) {
                if (currencyValue > 5) {
                    focusInput.current.value = String(currencyValue - 5)
                }
            }

            return;
        }

        const currencyValue = Number(restInput.current?.value)
        if (restInput.current) {
            if (currencyValue > 5) {
                restInput.current.value = String(currencyValue - 5)
            }
        }
    }

    function handleCancel() {
        setTimers({
            focus: 0,
            rest: 0
        })
        setTimerState('PAUSED')

        if (focusInput.current) {
            focusInput.current.value = ''
        }
        if (restInput.current) {
            restInput.current.value = ''
        }
    }

    function handleFocus() {

        if (timers.focus <= 0 || timers.rest <= 0) {
            return;
        }

        handleStart()

        setTimerState('FOCUS')
    }

    async function handleRest() {
        await handleEnd()

        const now = new Date()

        restTimer.restart(addSeconds(now, timers.rest * 60))

        setTimerState('REST')
    }

    function handleResume() {
        setTimerState('FOCUS')
        handleStart()
    }

    async function loadFocusMetrics(currentDate: string) {
        const { data } = await api.get<FocusMetrics[]>('/focus-time/metrics', {
            params: {
                date: currentDate
            }
        });
        const [metrics] = data

        setFocusMetrics(data)
    }

    async function loadFocusTimes(currentDate: string) {
        const { data } = await api.get<FocusTime[]>('/focus-time', {
            params: {
                date: currentDate
            }
        });

        setFocusTime(data)
    }

    async function handleSelectMonth(date: DateStringValue) {
        setCurrentMonth(dayjs(date))
    }
    async function handleSelectDate(date: DateStringValue) {
        setCurrentDate(dayjs(date))
    }

    useEffect(() => {
        loadFocusMetrics(currentMonth.toISOString())
    }, [currentMonth])

    useEffect(() => {
        loadFocusTimes(currentDate.toISOString())
    }, [currentDate])

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <Header title="Tempo de Foco" />
                <div className={styles['input-group']}>
                    <div className={styles.input}>
                        <PlusIcon size={24} onClick={() => handleAddMinutes('focus')} />
                        <input type="number" placeholder="Tempo de foco" ref={focusInput} disabled />
                        <MinusIcon size={24} onClick={() => handleRemoveMinutes('focus')} />
                    </div>
                    <div className={styles.input}>
                        <PlusIcon size={24} onClick={() => handleAddMinutes('rest')} />
                        <input type="number" placeholder="Tempo de descanso" ref={restInput} disabled />
                        <MinusIcon size={24} onClick={() => handleRemoveMinutes('rest')} />
                    </div>
                </div>
                <div className={styles.timer}>
                    <strong>{timerStateTitle[timerState]}</strong>
                    {timerState === 'PAUSED' && <span>{`${String(timers.focus).padStart(2, '0')}:00`}</span>}
                    {timerState === 'FOCUS' && <span>{`${String(focusTimer.minutes).padStart(2, '0')}:${String(focusTimer.seconds).padStart(2, '0')}`}</span>}
                    {timerState === 'REST' && <span>{`${String(restTimer.minutes).padStart(2, '0')}:${String(restTimer.seconds).padStart(2, '0')}`}</span>}
                </div>
                <div className={styles['button-group']}>
                    {timerState === "PAUSED" && (
                        <Button disabled={timers.focus <= 0 || timers.rest <= 0} onClick={handleFocus}
                        >Começar</Button>
                    )}
                    {timerState === "FOCUS" && (
                        <Button onClick={handleRest}>Iniciar Descanço</Button>
                    )}
                    {timerState === "REST" && (
                        <Button onClick={handleResume}>Retomar</Button>
                    )}
                    <Button variant="error" onClick={handleCancel}>Cancelar</Button>
                </div>
            </div>

            <div className={styles.metrics}>
                <h2>Estatiscas</h2>

                <div className={styles['info-container']}>
                    <Info value={String(metricsInfoByMonth.counter)} label="Ciclos concluidos" />
                    <Info value={`${metricsInfoByDay.totalTimeInMinutes} min`} label="Tempo total de foco" />
                </div>

                <div className={styles.calendar}>
                    <Calendar
                        getDayProps={(date) => ({
                            selected: dayjs(date).isSame(currentDate),
                            onClick: async () => await handleSelectDate(date)
                        })}
                        static
                        onMonthSelect={handleSelectMonth}
                        onNextMonth={handleSelectMonth}
                        onPreviousMonth={handleSelectMonth}
                        renderDay={(date) => {
                            const dayNumber = dayjs(date).date();
                            const dateKey = dayjs(date).format('YYYY-MM-DD');
                            const isSameDate = metricsInfoByMonth.completedDates.some((item) =>
                            dayjs(item).format('YYYY-MM-DD') === dateKey);

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
        </div>
    );
}

