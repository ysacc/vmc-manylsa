import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonText,
  IonImg,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from '@ionic/react';

import './Home.css'; // para estilos personalizados
import logo from '../assets/logo.png'; // agrega un logo en /src/assets/
import texts from '../constants/texts';

const Home = () => {
  const { appTitle, home } = texts;
 return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle className="ion-text-center">{appTitle}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding ion-text-center">
        <IonImg src={logo} alt="Logo del app" className="logo" />

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>{home.welcomeTitle}</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {home.welcomeDescription}
            <ul style={{ textAlign: 'left', marginTop: '1em' }}>
              {home.features.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </IonCardContent>
        </IonCard>

        <IonText color="medium">
          {home.instruction}
        </IonText>
      </IonContent>
    </IonPage>
  );
};

export default Home;