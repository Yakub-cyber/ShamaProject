import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import CRTTerminal from './components/CRTTerminal'
import Epsilon from './pages/Epsilon'

function App() {
	// hello
	return (
		<Router basename='/ShamaProject/'>
			<Routes>
				<Route path='/' element={<CRTTerminal />} />
				<Route path='/epsilon/' element={<Epsilon />} />
			</Routes>
		</Router>
	)
}

export default App
