import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonButton,
  IonItem,
  IonLabel,
  IonCheckbox,
  IonLoading,
  IonList,
  useIonViewWillEnter,
  IonSelect,
  IonSelectOption,
} from '@ionic/react';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient.';

const cargosDisponibles = [
  'Anciano',
  'Siervo Ministerial',
  'Precursor Regular',
  'Precursor Auxiliar',
  'Publicador',
  'Publicador No Bautizado',
];

const EditarAlumno = () => {
  const [loading, setLoading] = useState(true);
  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [alumnoId, setAlumnoId] = useState<string | null>(null);

  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [cargos, setCargos] = useState<string[]>([]);
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroCargo, setFiltroCargo] = useState('');

  useIonViewWillEnter(() => {
    const fetchAlumnos = async () => {
      const { data } = await supabase.from('alumnos').select();
      if (data) setAlumnos(data);
      setLoading(false);
    };

    fetchAlumnos();
  }, []);

  const cargarAlumno = async (id: string) => {
    setLoading(true);
    const { data } = await supabase.from('alumnos').select().eq('id', id).single();
    if (data) {
      setAlumnoId(id);
      setNombres(data.nombres);
      setApellidos(data.apellidos);
      setCargos(data.cargos || []);
    }
    setLoading(false);
  };

  const toggleCargo = (cargo: string) => {
    setCargos(prev =>
      prev.includes(cargo) ? prev.filter(c => c !== cargo) : [...prev, cargo]
    );
  };

  const actualizarAlumno = async () => {
    if (!alumnoId || !nombres || !apellidos) return;

    const { error } = await supabase
      .from('alumnos')
      .update({ nombres, apellidos, cargos })
      .eq('id', alumnoId);

    if (error) {
      console.error(error);
      alert('Error al actualizar');
    } else {
      alert('Alumno actualizado');
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Editar Alumno</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        <IonLoading isOpen={loading} message="Cargando..." />

        {/* Lista de alumnos */}
        {!alumnoId && (
          <>
            <IonLabel>Selecciona un alumno</IonLabel>
            <IonItem>
              <IonLabel position="floating">Buscar por nombre</IonLabel>
              <IonInput value={filtroNombre} onIonInput={e => setFiltroNombre(e.detail.value!)} />
            </IonItem>

            <IonItem>
              <IonLabel>Cargo</IonLabel>
              <IonSelect
                placeholder="Todos"
                value={filtroCargo}
                onIonChange={e => setFiltroCargo(e.detail.value)}
              >
                <IonSelectOption value="">Todos</IonSelectOption>
                {cargosDisponibles.map((cargo, i) => (
                  <IonSelectOption key={i} value={cargo}>
                    {cargo}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>


            <IonList>
              {alumnos
                .filter(a =>
                  (`${a.nombres} ${a.apellidos}`).toLowerCase().includes(filtroNombre.toLowerCase()) &&
                  (filtroCargo ? (a.cargos || []).includes(filtroCargo) : true)
                )
                .map(alumno => (

                <IonItem button key={alumno.id} onClick={() => cargarAlumno(alumno.id)}>
                  <div style={{ flexGrow: 1 }}>
                    {alumno.nombres} {alumno.apellidos}
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {alumno.cargos?.map((cargo: string, i: number) => {
                      const letras = cargo
                        .split(' ')
                        .map(p => p[0])
                        .join('')
                        .toUpperCase(); // ej: "Precursor Regular" → "PR"

                      const color = cargo === 'Anciano'
                        ? '#e74c3c'
                        : cargo === 'Siervo Ministerial'
                        ? '#3498db'
                        : cargo.includes('Precursor Regular')
                        ? '#2ecc71'
                        : cargo.includes('Precursor Auxiliar')
                        ? '#f9a825'
                        : '#95a5a6';

                      return (
                        <div
                          key={i}
                          style={{
                            backgroundColor: color,
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                          }}
                        >
                          {letras}
                        </div>
                      );
                    })}
                  </div>
                </IonItem>
              ))}
            </IonList>
          </>
        )}

        {/* Formulario de edición */}
        {alumnoId && (
          <>
            <IonInput
              placeholder="Nombres"
              value={nombres}
              onIonChange={e => setNombres(e.detail.value!)}
            />
            <IonInput
              placeholder="Apellidos"
              value={apellidos}
              onIonChange={e => setApellidos(e.detail.value!)}
            />

            <IonLabel style={{ marginTop: '1rem', display: 'block' }}>Cargos</IonLabel>
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

            <IonButton expand="block" onClick={actualizarAlumno} className="ion-margin-top">
              Guardar Cambios
            </IonButton>

            <IonButton expand="block" color="medium" onClick={() => setAlumnoId(null)}>
              ← Volver a lista
            </IonButton>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default EditarAlumno;
