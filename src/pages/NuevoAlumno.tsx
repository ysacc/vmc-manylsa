import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonButton,
  IonLabel,
  IonItem,
  IonCheckbox,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
} from '@ionic/react';
import { useState } from 'react';
import { supabase } from '../supabaseClient.';

const cargosDisponibles = [
  'Anciano',
  'Siervo Ministerial',
  'Precursor Regular',
  'Precursor Auxiliar',
  'Publicador',
  'Publicador No Bautizado',
  'Estudiante',
];

const NuevoAlumno = () => {
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [cargos, setCargos] = useState<string[]>([]);
  const [mensaje, setMensaje] = useState('');

  const toggleCargo = (cargo: string) => {
    setCargos(prev =>
      prev.includes(cargo) ? prev.filter(c => c !== cargo) : [...prev, cargo]
    );
  };

  const agregarAlumno = async () => {
    if (!nombres || !apellidos) {
      setMensaje('Completa nombres y apellidos');
      return;
    }

    const { error } = await supabase.from('alumnos').insert({ nombres, apellidos, cargos });

    if (error) {
      console.error(error);
      setMensaje('Error al registrar alumno');
    } else {
      setNombres('');
      setApellidos('');
      setCargos([]);
      setMensaje('Alumno registrado correctamente');
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Nuevo Alumno</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <IonGrid>
          <IonRow>
            <IonCol size="12" sizeMd="6">
              <IonItem>
                <IonLabel position="floating">Nombres</IonLabel>
                <IonInput
                  value={nombres}
                  onIonChange={e => setNombres(e.detail.value!)}
                />
              </IonItem>
            </IonCol>
            <IonCol size="12" sizeMd="6">
              <IonItem>
                <IonLabel position="floating">Apellidos</IonLabel>
                <IonInput
                  value={apellidos}
                  onIonChange={e => setApellidos(e.detail.value!)}
                />
              </IonItem>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol size="12">
              <IonLabel className="ion-margin-top">Cargos</IonLabel>
              {cargosDisponibles.map((cargo, index) => (
                <IonItem key={index}>
                  <IonCheckbox
                    slot="start"
                    checked={cargos.includes(cargo)}
                    onIonChange={() => toggleCargo(cargo)}
                  />
                  <IonLabel>{cargo}</IonLabel>
                </IonItem>
              ))}
            </IonCol>
          </IonRow>

          <IonRow className="ion-margin-top">
            <IonCol size="12">
              <IonButton expand="block" onClick={agregarAlumno}>
                Guardar
              </IonButton>
              {mensaje && (
                <IonText color={mensaje.includes('Error') ? 'danger' : 'success'}>
                  <p className="ion-padding-top ion-text-center">{mensaje}</p>
                </IonText>
              )}
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default NuevoAlumno;
