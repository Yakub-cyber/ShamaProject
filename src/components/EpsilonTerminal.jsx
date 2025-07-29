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
	const [waitingForMultipleChoice, setWaitingForMultipleChoice] = useState(false)
	const [waitingForClarification, setWaitingForClarification] = useState(false)
	const [clarificationQuestion, setClarificationQuestion] = useState('')

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
		'Типы систем, с которыми вы работали',
		'Связь с предыдущими инцидентами или утечками',
		'Наличие имплантов или вмешательства в ЦНС',
		'Склонны ли вы к галлюцинациям / дежавю / расщеплению личности?',
		'Проходили ли вы «Обрезку сигнала»?',
		'Навыки / Специализация (отметьте все подходящее)',
		'Дополнительная информация'
	]

	// Определяем типы выбора для каждого вопроса
	const questionTypes = {
		9: 'E',  // Уровень допуска - Единичный выбор
		10: 'E', // Опыт взаимодействия с ИИ/киберсистемами - Единичный выбор
		11: 'M', // Типы систем, с которыми вы работали - Множественный выбор
		12: 'E', // Связь с предыдущими инцидентами или утечками - Единичный выбор
		13: 'E', // Наличие имплантов или вмешательства в ЦНС - Единичный выбор
		14: 'E', // Склонны ли вы к галлюцинациям / дежавю / расщеплению личности? - Единичный выбор
		15: 'E', // Проходили ли вы «Обрезку сигнала»? - Единичный выбор
		16: 'M', // Навыки / Специализация - Множественный выбор
		17: 'T'  // Дополнительная информация - Текстовый ввод
	}

	// Валидация для текстовых полей
	const textValidations = {
		1: (value) => {
			if (!value || value.trim().length < 2) {
				return 'ФИО должно содержать минимум 2 символа'
			}
			if (!/^[а-яёА-ЯЁ\s]+$/.test(value)) {
				return 'ФИО должно содержать только русские буквы'
			}
			return null
		},
		2: (value) => {
			if (!value || value.trim().length < 2) {
				return 'Позывной должен содержать минимум 2 символа'
			}
			return null
		},
		3: (value) => {
			if (!value || !/^\d+$/.test(value.trim())) {
				return 'Возраст должен содержать только цифры'
			}
			return null
		},
		17: (value) => {
			if (!value || value.trim().length < 5) {
				return 'Дополнительная информация должна содержать минимум 5 символов'
			}
			return null
		}
	}

	const checkboxQuestions = {
		9: { // Уровень допуска - Е
			question: 'Уровень допуска:',
			options: [
				'0 - гражданский',
				'1 - лабораторный доступ', 
				'2 - внутренняя сеть',
				'3 - ядро системы',
				'Black - экспериментальный ИИ-допуск (запрещено)'
			]
		},
		10: { // Опыт взаимодействия с ИИ/киберсистемами - Е
			question: 'Опыт взаимодействия с ИИ/киберсистемами:',
			options: [
				'Пользователь',
				'Инженер',
				'Архитектор',
				'Создатель'
			]
		},
		11: { // Типы систем - М
			question: 'Типы систем, с которыми вы работали:',
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
		12: { // Связь с инцидентами - Е
			question: 'Связь с предыдущими инцидентами или утечками:',
			options: [
				'Нет',
				'Да (уточните)'
			],
			needsClarification: 1 // Индекс варианта "Да"
		},
		13: { // Импланты - Е
			question: 'Наличие имплантов или вмешательств в ЦНС:',
			options: [
				'Нет',
				'Да (тип, производитель)'
			],
			needsClarification: 1 // Индекс варианта "Да"
		},
		14: { // Галлюцинации - Е
			question: 'Склонны ли вы к галлюцинациям / дежавю / расщеплению личности?',
			options: [
				'Нет',
				'Иногда',
				'Часто',
				'Неизвестно'
			]
		},
		15: { // Обрезка сигнала - Е
			question: 'Проходили ли вы «Обрезку сигнала»?',
			options: [
				'Да (уровень)',
				'Нет',
				'Неизвестно'
			],
			needsClarification: 0 // Индекс варианта "Да"
		},
		16: { // Навыки - М
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
			
			// Определяем тип выбора для текущего вопроса
			const questionType = questionTypes[questionIndex]
			if (questionType === 'M') {
				appendLine('Введите номера выбранных вариантов через запятую (например: 1,3,5):')
				setWaitingForMultipleChoice(true)
			} else {
				appendLine('Введите номер выбранного варианта:')
				setWaitingForMultipleChoice(false)
			}
			
			// Дополнительная прокрутка для чекбоксов
			setTimeout(() => {
				if (outputRef.current) {
					outputRef.current.scrollTop = outputRef.current.scrollHeight
				}
			}, 200)
		}
	}

	const parseMultipleChoice = (input, options) => {
		const selectedNumbers = input.split(',').map(num => parseInt(num.trim())).filter(num => !isNaN(num) && num > 0 && num <= options.length)
		return selectedNumbers.map(num => options[num - 1]).join(', ')
	}

	const validateMultipleChoice = (input, options) => {
		if (!input || input.trim() === '') {
			return 'Необходимо выбрать хотя бы один вариант'
		}
		
		const numbers = input.split(',').map(num => num.trim())
		const validNumbers = []
		const invalidNumbers = []
		
		numbers.forEach(num => {
			const parsed = parseInt(num)
			if (!isNaN(parsed) && parsed > 0 && parsed <= options.length) {
				validNumbers.push(parsed)
			} else {
				invalidNumbers.push(num)
			}
		})
		
		if (invalidNumbers.length > 0) {
			return `Некорректные номера: ${invalidNumbers.join(', ')}. Допустимые значения: 1-${options.length}`
		}
		
		if (validNumbers.length === 0) {
			return 'Необходимо выбрать хотя бы один корректный вариант'
		}
		
		// Проверка на дубликаты
		const uniqueNumbers = [...new Set(validNumbers)]
		if (uniqueNumbers.length !== validNumbers.length) {
			return 'Обнаружены дублирующиеся номера. Каждый вариант можно выбрать только один раз'
		}
		
		return null
	}

	const validateSingleChoice = (input, options) => {
		if (!input || input.trim() === '') {
			return 'Необходимо выбрать один вариант'
		}
		
		// Проверяем, что введена только одна цифра
		if (input.includes(',') || input.includes(' ') || input.length > 1) {
			return 'Для единичного выбора введите только одну цифру'
		}
		
		const selectedNumber = parseInt(input.trim())
		if (isNaN(selectedNumber)) {
			return 'Введите корректный номер варианта'
		}
		
		if (selectedNumber < 1 || selectedNumber > options.length) {
			return `Номер должен быть от 1 до ${options.length}`
		}
		
		return null
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

		// Если ожидается уточнение
		if (waitingForClarification) {
			const currentQ = questions[currentQuestion - 1]
			setAnswers(prev => ({ ...prev, [currentQ]: command }))
			setWaitingForClarification(false)
			setClarificationQuestion('')
			
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
					// Создаем обновленные ответы с последним ответом
					let finalAnswer = command
					
					// Если это множественный выбор, обрабатываем его
					if (questionTypes[currentQuestion] === 'M' && checkboxQuestions[currentQuestion]) {
						finalAnswer = parseMultipleChoice(command, checkboxQuestions[currentQuestion].options)
					}
					// Если это единичный выбор, обрабатываем его
					else if (questionTypes[currentQuestion] === 'E' && checkboxQuestions[currentQuestion]) {
						const selectedNumber = parseInt(command)
						finalAnswer = checkboxQuestions[currentQuestion].options[selectedNumber - 1]
					}
					
					const finalAnswers = { ...answers, [currentQ]: finalAnswer }
					saveToFile(finalAnswers)
					appendLine('ФАЙЛ СОХРАНЕН.')
				}, 1000)
			}
			return
		}

		if (currentQuestion < questions.length) {
			// Сохраняем ответ на текущий вопрос
			const currentQ = questions[currentQuestion - 1] // -1 потому что currentQuestion начинается с 1
			
			// Проверяем, есть ли чекбоксы для текущего вопроса
			if (checkboxQuestions[currentQuestion]) {
				const checkboxData = checkboxQuestions[currentQuestion]
				const questionType = questionTypes[currentQuestion]
				
				if (questionType === 'M') {
					// Валидация множественного выбора
					const validationError = validateMultipleChoice(command, checkboxData.options)
					if (validationError) {
						appendLine(`ОШИБКА: ${validationError}`)
						appendLine('Повторите ввод:')
						return
					}
					
					// Множественный выбор
					const selectedOptions = parseMultipleChoice(command, checkboxData.options)
					setAnswers(prev => ({ ...prev, [currentQ]: selectedOptions }))
				} else {
					// Валидация единичного выбора
					const validationError = validateSingleChoice(command, checkboxData.options)
					if (validationError) {
						appendLine(`ОШИБКА: ${validationError}`)
						appendLine('Повторите ввод:')
						return
					}
					
					// Единичный выбор
					const selectedNumber = parseInt(command)
					const selectedOption = checkboxData.options[selectedNumber - 1]
					
					// Проверяем, нуждается ли ответ в уточнении
					if (checkboxData.needsClarification !== undefined && selectedNumber - 1 === checkboxData.needsClarification) {
						setWaitingForClarification(true)
						
						// Определяем вопрос для уточнения
						let clarificationText = ''
						if (currentQuestion === 12) { // Связь с инцидентами
							clarificationText = 'Уточните связь с предыдущими инцидентами или утечками:'
						} else if (currentQuestion === 13) { // Импланты
							clarificationText = 'Напишите тип, производитель:'
						} else if (currentQuestion === 15) { // Обрезка сигнала
							clarificationText = 'Уточните уровень "Обрезки сигнала":'
						}
						
						setClarificationQuestion(clarificationText)
						appendLine('')
						appendLine(clarificationText)
						return
					}
					
					setAnswers(prev => ({ ...prev, [currentQ]: selectedOption }))
				}
			} else {
				// Валидация текстовых полей
				const validation = textValidations[currentQuestion]
				if (validation) {
					const validationError = validation(command)
					if (validationError) {
						appendLine(`ОШИБКА: ${validationError}`)
						appendLine('Повторите ввод:')
						return
					}
				}
				
				// Обычный текстовый ответ
				setAnswers(prev => ({ ...prev, [currentQ]: command }))
			}
			
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
					// Создаем обновленные ответы с последним ответом
					let finalAnswer = command
					
					// Если это множественный выбор, обрабатываем его
					if (questionTypes[currentQuestion] === 'M' && checkboxQuestions[currentQuestion]) {
						finalAnswer = parseMultipleChoice(command, checkboxQuestions[currentQuestion].options)
					}
					// Если это единичный выбор, обрабатываем его
					else if (questionTypes[currentQuestion] === 'E' && checkboxQuestions[currentQuestion]) {
						const selectedNumber = parseInt(command)
						finalAnswer = checkboxQuestions[currentQuestion].options[selectedNumber - 1]
					}
					
					const finalAnswers = { ...answers, [questions[currentQuestion - 1]]: finalAnswer }
					saveToFile(finalAnswers)
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