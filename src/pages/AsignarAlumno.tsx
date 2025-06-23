import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSelect,
  IonSelectOption,
  IonLabel,
  IonItem,
  IonInput,
  IonButton,
  IonDatetime,
  IonText,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  useIonViewWillEnter,
  IonDatetimeButton,
  IonModal,
} from '@ionic/react';
import { useState } from 'react';
import { supabase } from '../supabaseClient.';
import { format } from 'date-fns';


const AsignarAlumno = () => {
  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [encargadoId, setEncargadoId] = useState('');
  const [ayudanteId, setAyudanteId] = useState('');
  const [sala, setSala] = useState('');
  const [numeroDiscurso, setNumeroDiscurso] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString());
  const [busquedaEncargado, setBusquedaEncargado] = useState('');
  const [busquedaAyudante, setBusquedaAyudante] = useState('');
  const [sugerenciasEncargado, setSugerenciasEncargado] = useState<any[]>([]);
  const [sugerenciasAyudante, setSugerenciasAyudante] = useState<any[]>([]);

  const [asignacionRecienteEncargado, setAsignacionRecienteEncargado] = useState(false);
  const [asignacionRecienteAyudante, setAsignacionRecienteAyudante] = useState(false);
  const [sinAsignacion, setSinAsignacion] = useState<any[]>([]);

  useIonViewWillEnter(() => {
    const fetchAlumnos = async () => {
      const { data } = await supabase.from('alumnos').select('id, nombres, apellidos');
      if (data) setAlumnos(data);
    };
    fetchAlumnos();
    obtenerAlumnosSinAsignacion();
  });

const verificarAsignacionReciente = async (id: string, tipo: 'encargado' | 'ayudante') => {
  const haceUnMes = new Date();
  haceUnMes.setMonth(haceUnMes.getMonth() - 1);
  const campo = tipo === 'encargado' ? 'encargado_id' : 'ayudante_id';

  const { data } = await supabase
    .from('asignaciones')
    .select()
    .eq(campo, id)
    .gte('fecha', format(haceUnMes, 'yyyy-MM-dd'));

  const tuvo = !!data && data.length > 0;
  if (tipo === 'encargado') setAsignacionRecienteEncargado(tuvo);
  else setAsignacionRecienteAyudante(tuvo);
};

const obtenerAlumnosSinAsignacion = async () => {
  const haceUnMes = new Date();
  haceUnMes.setMonth(haceUnMes.getMonth() - 1);

  const { data: asignados } = await supabase
    .from('asignaciones')
    .select('encargado_id, ayudante_id')
    .gte('fecha', format(haceUnMes, 'yyyy-MM-dd'));

  const idsAsignados = [
    ...new Set([
      ...(asignados?.map(a => a.encargado_id) || []),
      ...(asignados?.map(a => a.ayudante_id).filter(Boolean) || []),
    ]),
  ];

  if (!idsAsignados.length) {
    // Si no hay asignados, retornar todos los alumnos
    const { data } = await supabase.from('alumnos').select();
    setSinAsignacion(data || []);
    return;
  }

  const { data: alumnosSinParte } = await supabase
    .from('alumnos')
    .select()
    .not('id', 'in', `(${idsAsignados.join(',')})`);

  setSinAsignacion(alumnosSinParte || []);
};

const guardarAsignacion = async () => {
  if (!encargadoId || !sala || !numeroDiscurso || !fecha) {
    alert('Completa los campos obligatorios');
    return;
  }

  const { error } = await supabase.from('asignaciones').insert({
    encargado_id: encargadoId,
    ayudante_id: ayudanteId || null,
    sala,
    numero_discurso: numeroDiscurso,
    fecha: format(new Date(fecha), 'yyyy-MM-dd'), // más claro
  });

  if (error) {
    console.error(error);
    alert('Error al guardar');
  } else {
    alert('Asignación guardada');
    setEncargadoId('');
    setAyudanteId('');
    setSala('');
    setNumeroDiscurso('');
    setFecha(new Date().toISOString());
    setAsignacionRecienteEncargado(false);
    setAsignacionRecienteAyudante(false);
    obtenerAlumnosSinAsignacion();
  }
};


  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Asignar Alumno</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        {/* Encargado */}
          <IonItem lines="none">
            <IonLabel position="floating">Encargado *</IonLabel>
            <IonInput
              value={busquedaEncargado}
              onIonInput={e => {
                const texto = (e.detail.value as string).toLowerCase();
                setBusquedaEncargado(texto);
                const coincidencias = alumnos.filter(a =>
                  `${a.nombres} ${a.apellidos}`.toLowerCase().includes(texto)
                );
                setSugerenciasEncargado(coincidencias);
              }}
            />
          </IonItem>
          {busquedaEncargado && sugerenciasEncargado.length > 0 && (
          <div style={{
                      marginLeft: 16,
                      marginBottom: 10,
                      border: '1px solid var(--ion-color-medium)',
                      borderRadius: 4,
                      background: 'var(--ion-background-color)',
                      color: 'var(--ion-text-color)',
                      boxShadow: '0px 2px 5px rgba(0,0,0,0.2)',
                    }}>              {sugerenciasEncargado.map(a => (
                <div
                  key={a.id}
                   style={{
                      padding: '8px',
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--ion-color-light)',
                    }}
                  onClick={() => {
                    setEncargadoId(a.id);
                    setBusquedaEncargado(`${a.nombres} ${a.apellidos}`);
                    setSugerenciasEncargado([]);
                    verificarAsignacionReciente(a.id, 'encargado');
                  }}
                >
                  {a.nombres} {a.apellidos}
                </div>
              ))}
            </div>
          )}
          {asignacionRecienteEncargado && (
            <IonText color="warning">
              <p className="ion-padding-start">⚠️ Este alumno ya tuvo asignación en el último mes.</p>
            </IonText>
          )}


        {/* Ayudante */}
        <IonItem lines="none">
          <IonLabel position="floating">Ayudante (opcional)</IonLabel>
          <IonInput
            value={busquedaAyudante}
            onIonInput={e => {
              const texto = (e.detail.value as string).toLowerCase();
              setBusquedaAyudante(texto);
              const coincidencias = alumnos.filter(a =>
                `${a.nombres} ${a.apellidos}`.toLowerCase().includes(texto) &&
                a.id !== encargadoId
              );
              setSugerenciasAyudante(coincidencias);
            }}
          />
        </IonItem>
        {busquedaAyudante && sugerenciasAyudante.length > 0 && (
          <div style={{
            marginLeft: 16,
            marginBottom: 10,
            border: '1px solid var(--ion-color-medium)',
            borderRadius: 4,
            background: 'var(--ion-background-color)',
            color: 'var(--ion-text-color)',
            boxShadow: '0px 2px 5px rgba(0,0,0,0.2)',
          }}>
            {sugerenciasAyudante.map(a => (
              <div
                key={a.id}
                style={{
                  padding: '8px',
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--ion-color-light)',
                }}
                onClick={() => {
                  setAyudanteId(a.id);
                  setBusquedaAyudante(`${a.nombres} ${a.apellidos}`);
                  setSugerenciasAyudante([]);
                  verificarAsignacionReciente(a.id, 'ayudante');
                }}
              >
                {a.nombres} {a.apellidos}
              </div>
            ))}
          </div>
        )}
        {asignacionRecienteAyudante && (
          <IonText color="warning">
            <p className="ion-padding-start">⚠️ Este ayudante ya tuvo asignación en el último mes.</p>
          </IonText>
        )}

        {/* Sala */}
        <IonItem>
          <IonLabel>Sala</IonLabel>
          <IonSelect value={sala} placeholder="A o B" onIonChange={e => setSala(e.detail.value)}>
            <IonSelectOption value="A">A</IonSelectOption>
            <IonSelectOption value="B">B</IonSelectOption>
          </IonSelect>
        </IonItem>

        {/* Discurso */}
        <IonItem>
          <IonLabel position="floating">Número del discurso</IonLabel>
          <IonInput
            value={numeroDiscurso}
            onIonChange={e => setNumeroDiscurso(e.detail.value!)}
          />
        </IonItem>

        {/* Fecha */}
        <IonItem>
          <IonLabel>Fecha</IonLabel>
          <IonDatetimeButton datetime="fechaSelector" />
        </IonItem>

        {/* Guardar */}
        <IonButton expand="block" onClick={guardarAsignacion} className="ion-margin-top">
          Guardar Asignación
        </IonButton>

        {/* Alumnos sin parte */}
        <IonCard className="ion-margin-top">
          <IonCardHeader>
            <IonCardTitle>Alumnos sin parte hace más de un mes</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {sinAsignacion.length === 0 ? (
              <IonText color="medium">Todos los alumnos han tenido asignación reciente.</IonText>
            ) : (
              sinAsignacion.map(al => (
                <p key={al.id}>
                  {al.nombres} {al.apellidos}
                </p>
              ))
            )}
          </IonCardContent>
        </IonCard>
        <IonModal keepContentsMounted={true}>
          <IonDatetime
            id="fechaSelector"
            presentation="date"
            value={fecha}
            onIonChange={e => {
              const value = e.detail.value;
              if (typeof value === 'string') setFecha(value);
            }}
            showDefaultButtons={true}
          />
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default AsignarAlumno;
