import { useEffect, useRef, useState } from 'react'
import './CRTTerminal.css'

const CRTTerminal = () => {
	const inputRef = useRef(null)
	const outputRef = useRef(null)
	const [history, setHistory] = useState([
		'ДОБРО ПОЖАЛОВАТЬ В ТЕРМИНАЛ CRT.',
		'',
		'ВВЕДИТЕ КОМАНДУ:',
	])

	const appendLine = line => {
		setHistory(prev => [...prev, line])
	}

	const handleCommand = async command => {
		appendLine(`> ${command}`)

		if (command === 'epsilon application' || command === 'EPSILON APPLICATION') {
			appendLine('ПОДКЛЮЧЕНИЕ К СИСТЕМЕ...')
			setTimeout(() => {
				window.location.href = '/ShamaProject/epsilon/'
			}, 1200)
			return
		}

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
			const command = inputRef.current.innerText.trim().toLowerCase()
			if (!command) return
			inputRef.current.innerText = ''
			handleCommand(command)
		}
	}

	useEffect(() => {
		inputRef.current.focus()
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

export default CRTTerminal
