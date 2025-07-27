import { useEffect, useRef, useState } from 'react'
import './CRTTerminal.css'

const EpsilonTerminal = () => {
	const inputRef = useRef(null)
	const outputRef = useRef(null)
	const [history, setHistory] = useState([
		'ВХОД В СИСТЕМУ EPSILON.',
		'',
		'ФИО (как в паспорте)',
	])

	const [currentQuestion, setCurrentQuestion] = useState(1) // Начинаем с 1, так как первый вопрос уже показан
	const [answers, setAnswers] = useState({})

	const questions = [
		'ФИО (как в паспорте)',
		'Позывной / псевдоним',
		'Возраст',
		'Идентификационный номер',
		'Биометрический ID',
		'Кровь ()',
		'Основной навык (одно слово)',
		'Краткое резюме',
		'Уровень допуска',
		'Опыт взаимодействия с ИИ/киберсистемами',
		'С какими типами систем вы работали',
		'Связь с предыдущими инцидентами или утечками (Yes/No)',
		'Наличие имплантов или вмешательств в ЦНС (Yes/No)',
		'Склонны ли вы к галлюцинациям / дежавю / расщеплению личности?',
		'Проходили ли вы «Обрезку сигнала»? (Yes/No)',
		'Навыки / Специализации / (отметье все подходящее)'
	]

	const checkboxQuestions = {
		8: { // Уровень допуска
			question: 'Уровень допуска:',
			options: [
				'0 - гражданский',
				'1 - лабораторный доступ', 
				'2 - внутренняя сеть',
				'3 - ядро системы',
				'Black - экспериментальный ИИ-допуск (запрещено)'
			]
		},
		9: { // Опыт взаимодействия с ИИ/киберсистемами
			question: 'Опыт взаимодействия с ИИ/киберсистемами:',
			options: [
				'Пользователь',
				'Инженер',
				'Архитектор',
				'Создатель'
			]
		},
		10: { // Типы систем
			question: 'С какими типами систем вы работали:',
			options: [
				'Нейросети',
				'Дроны',
				'Биокодинг',
				'Передача памяти',
				'Бета-модуляция',
				'Взлом закрытых каналов',
				'Другое'
			]
		},
		11: { // Связь с инцидентами
			question: 'Связь с предыдущими инцидентами или утечками:',
			options: [
				'Нет',
				'Да (уточните)'
			]
		},
		12: { // Импланты
			question: 'Наличие имплантов или вмешательств в ЦНС:',
			options: [
				'Нет',
				'Да (тип, производитель)'
			]
		},
		13: { // Галлюцинации
			question: 'Склонны ли вы к галлюцинациям / дежавю / расщеплению личности?',
			options: [
				'Нет',
				'Иногда',
				'Часто',
				'Неизвестно'
			]
		},
		14: { // Обрезка сигнала
			question: 'Проходили ли вы «Обрезку сигнала»?',
			options: [
				'Да (уровень)',
				'Нет',
				'Неизвестно'
			]
		},
		15: { // Навыки
			question: 'Навыки / Специализация (отметьте все подходящее):',
			options: [
				'Архитектор ИИ',
				'Цифровой шифровальщик',
				'Техник-дронов',
				'Системный инженер',
				'Взломщик протоколов',
				'Хирург памяти',
				'Создание вирусов',
				'Радиохимик',
				'Другое'
			]
		}
	}

	const appendLine = line => {
		setHistory(prev => [...prev, line])
		// Автоматическая прокрутка вниз после добавления новой строки
		setTimeout(() => {
			if (outputRef.current) {
				outputRef.current.scrollTop = outputRef.current.scrollHeight
			}
		}, 100)
	}

	const showCheckboxQuestion = (questionIndex) => {
		const checkboxData = checkboxQuestions[questionIndex]
		if (checkboxData) {
			appendLine('')
			appendLine(checkboxData.question)
			checkboxData.options.forEach((option, index) => {
				appendLine(`[${index + 1}] ${option}`)
			})
			appendLine('')
			appendLine('Введите номера выбранных вариантов через запятую:')
			// Дополнительная прокрутка для чекбоксов
			setTimeout(() => {
				if (outputRef.current) {
					outputRef.current.scrollTop = outputRef.current.scrollHeight
				}
			}, 200)
		}
	}

	const saveToFile = (data) => {
		const content = `АНКЕТА EPSILON
Дата заполнения: ${new Date().toLocaleString()}
==========================================

${Object.entries(data).map(([question, answer]) => `${question}: ${answer}`).join('\n')}

==========================================
Анкета заполнена автоматически системой EPSILON.`

		const blob = new Blob([content], { type: 'text/plain' })
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = `epsilon_anketa_${new Date().toISOString().slice(0, 10)}.txt`
		document.body.appendChild(a)
		a.click()
		document.body.removeChild(a)
		URL.revokeObjectURL(url)
	}

	const handleCommand = async command => {
		appendLine(`> ${command}`)

		if (currentQuestion < questions.length) {
			// Сохраняем ответ на текущий вопрос
			const currentQ = questions[currentQuestion - 1] // -1 потому что currentQuestion начинается с 1
			setAnswers(prev => ({ ...prev, [currentQ]: command }))
			
			// Переходим к следующему вопросу
			const nextQuestion = currentQuestion + 1
			setCurrentQuestion(nextQuestion)
			
			if (nextQuestion < questions.length) {
				// Проверяем, есть ли чекбоксы для следующего вопроса
				if (checkboxQuestions[nextQuestion]) {
					showCheckboxQuestion(nextQuestion)
				} else {
					appendLine('')
					appendLine(questions[nextQuestion - 1]) // -1 для правильного индекса
				}
			} else {
				// Все вопросы заполнены
				appendLine('')
				appendLine('АНКЕТА ЗАПОЛНЕНА.')
				appendLine('СОХРАНЕНИЕ В ФАЙЛ...')
				
				setTimeout(() => {
					saveToFile({ ...answers, [currentQ]: command })
					appendLine('ФАЙЛ СОХРАНЕН.')
				}, 1000)
			}
			return
		}

		// Если анкета уже заполнена, обрабатываем обычные команды
		try {
			const response = await fetch('/api/terminal', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ answer: command }),
			})

			const data = await response.json()
			if (data.done) {
				appendLine('')
				appendLine(data.message)
				inputRef.current.setAttribute('contenteditable', 'false')
				inputRef.current.style.display = 'none'
			} else if (data.question) {
				appendLine(data.question)
			} else {
				appendLine('[Ошибка: пустой ответ от сервера]')
			}
		} catch {
			appendLine('[Ошибка соединения]')
		}
	}

	const onKeyDown = e => {
		if (e.key === 'Enter') {
			e.preventDefault()
			const command = inputRef.current.innerText.trim()
			if (!command) return
			inputRef.current.innerText = ''
			handleCommand(command)
		}
	}

	useEffect(() => {
		inputRef.current.focus()
		// Прокрутка вниз при загрузке
		setTimeout(() => {
			if (outputRef.current) {
				outputRef.current.scrollTop = outputRef.current.scrollHeight
			}
		}, 500)
	}, [])

	return (
		<div id='monitor'>
			<div id='screen'>
				<div id='crt' onClick={() => inputRef.current.focus()}>
					<div className='terminal' ref={outputRef}>
						<div id='output'>
							{history.map((line, index) => (
								<div key={index} className='char'>
									{line}
								</div>
							))}
						</div>
						<div
							id='input'
							contentEditable={true}
							ref={inputRef}
							onKeyDown={onKeyDown}
						/>
					</div>
					<div className='scanline'></div>
				</div>
			</div>
		</div>
	)
}

export default EpsilonTerminal 