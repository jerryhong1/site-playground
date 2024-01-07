import styles from '../styles/Home.module.css'
import { useEffect } from 'react'
import RaindropsSketch from './Raindrops'

export default function TestPage () {
  // const canvasRef = useRef(null)

  useEffect(() => {
    const contentDiv = document.getElementById('content')
    if (contentDiv) {
      contentDiv.style.opacity = '1'
      contentDiv.style.transition = 'opacity 2s'
    }
  }, [])

  return (
    <div className={styles.raindrop_container}>
      <RaindropsSketch />
      <div id="content" style={{ position: 'absolute', color: '#333333', top: 0, left: 0, paddingLeft: '32px', opacity: 0 }}>
        <h2>Jerry Hong</h2>
        <p>Lots of text. Lots of text Lots of text Lots of text.</p>
      </div>
    </div>
  )
}
