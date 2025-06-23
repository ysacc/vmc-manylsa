import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonRouterOutlet,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  setupIonicReact,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { home, personAdd, calendar, create } from 'ionicons/icons';

import Home from './pages/Home';
import NuevoAlumno from './pages/NuevoAlumno';
import ProgramacionMensual from './pages/ProgramacionMensual';
import AsignarAlumno from './pages/AsignarAlumno';
import EditarAlumno from './pages/EditarAlumno';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';


setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet>
          <Route path="/home" component={Home} exact />
          <Route path="/nuevo" component={NuevoAlumno} exact />
          <Route path="/editar" component={EditarAlumno} exact />
          <Route path="/programacion" component={ProgramacionMensual} exact />
          <Route path="/asignar" component={AsignarAlumno} exact />
          <Redirect exact from="/" to="/home" />
        </IonRouterOutlet>
        <IonTabBar slot="bottom">
          <IonTabButton tab="home" href="/home">
            <IonIcon icon={home} />
            <IonLabel>Inicio</IonLabel>
          </IonTabButton>
          <IonTabButton tab="nuevo" href="/nuevo">
            <IonIcon icon={personAdd} />
            <IonLabel>Estudiante</IonLabel>
          </IonTabButton>
          <IonTabButton tab="editar" href="/editar">
            <IonIcon icon={personAdd} />
            <IonLabel>Editar</IonLabel>
          </IonTabButton>
          <IonTabButton tab="programacion" href="/programacion">
            <IonIcon icon={calendar} />
            <IonLabel>Mes</IonLabel>
          </IonTabButton>
          <IonTabButton tab="asignar" href="/asignar">
            <IonIcon icon={create} />
            <IonLabel>Asignar</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </IonReactRouter>
  </IonApp>
);

export default App;