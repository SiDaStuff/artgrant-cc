import '@fontsource/caveat/latin-400.css'
import '@fontsource/manrope/latin-400.css'
import '@fontsource/manrope/latin-500.css'
import './styles/global.css'
import { PresentationController } from './presentation/PresentationController'
import { Scene01 } from './scenes/scene01/Scene01'

const app = document.querySelector<HTMLDivElement>('#app')!
const controller = new PresentationController(app, new Scene01())
controller.start()
if (import.meta.hot) import.meta.hot.dispose(() => controller.dispose())
