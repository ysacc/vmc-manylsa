import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonSelect, IonSelectOption, IonDatetime, IonButton, IonLabel,
  IonItem, IonGrid, IonRow, IonCol, IonCard, IonCardHeader,
  IonCardTitle, IonCardContent, IonText, IonButtons, IonModal,
  IonToast, useIonViewWillEnter, IonInput,
  IonDatetimeButton
} from '@ionic/react';

import { useState } from 'react';
import { supabase } from '../supabaseClient.';
import {
  format, startOfMonth, endOfMonth, parseISO, startOfWeek,
  endOfWeek, getWeekOfMonth
} from 'date-fns';
import { es } from 'date-fns/locale';

const ProgramacionMensual = () => {
  const [asignaciones, setAsignaciones] = useState<any[]>([]);
  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [salaFiltro, setSalaFiltro] = useState('');
  const [fechaFiltro, setFechaFiltro] = useState(new Date().toISOString());
  const [modoVista, setModoVista] = useState<'mes' | 'semana'>('mes');
  const [showModal, setShowModal] = useState(false);
  const [asignacionSeleccionada, setAsignacionSeleccionada] = useState<any>(null);
  const [toastMensaje, setToastMensaje] = useState('');
  const [showToast, setShowToast] = useState(false);

  const fetchAlumnos = async () => {
    const { data } = await supabase.from('alumnos').select('id, nombres, apellidos');
    if (data) setAlumnos(data);
  };

 const fetchAsignaciones = async () => {
  const fecha = parseISO(fechaFiltro);
  const inicio = modoVista === 'semana'
    ? startOfWeek(fecha, { weekStartsOn: 1 })
    : startOfMonth(fecha);
  const fin = modoVista === 'semana'
    ? endOfWeek(fecha, { weekStartsOn: 1 })
    : endOfMonth(fecha);

  // Fetch de asignaciones
  const { data: asignaciones, error: asignacionesError } = await supabase
    .from('asignaciones')
    .select('*')
    .gte('fecha', format(inicio, 'yyyy-MM-dd'))
    .lte('fecha', format(fin, 'yyyy-MM-dd'))
    .order('fecha', { ascending: true });

  // Fetch de alumnos
  const { data: alumnos, error: alumnosError } = await supabase
    .from('alumnos')
    .select('id, nombres, apellidos');

  if (asignacionesError || alumnosError) {
    console.error('Error al cargar asignaciones o alumnos:', {
      asignacionesError,
      alumnosError,
    });
    return;
  }

  // Hacer join manual
  const asignacionesConNombres = asignaciones.map((a) => ({
    ...a,
    encargado: alumnos.find((al) => al.id === a.encargado_id) || null,
    ayudante: alumnos.find((al) => al.id === a.ayudante_id) || null,
  }));

  // Filtrar por sala si hay filtro
  const resultado = salaFiltro
    ? asignacionesConNombres.filter((a) => a.sala === salaFiltro)
    : asignacionesConNombres;

  setAsignaciones(resultado);
};

  useIonViewWillEnter(() => {
    fetchAlumnos();
    fetchAsignaciones();
  });

const agruparPorSemanaYSala = (lista: any[]) => {
  const agrupado: {
    [semana: string]: {
      [sala: string]: any[]
    }
  } = {};

  lista.forEach(asig => {
    const fecha = new Date(asig.fecha);
    const semana = `Semana ${getWeekOfMonth(fecha, { weekStartsOn: 1 })}`;
    const sala = asig.sala;

    if (!agrupado[semana]) agrupado[semana] = {};
    if (!agrupado[semana][sala]) agrupado[semana][sala] = [];

    agrupado[semana][sala].push(asig);
  });

  // Ordenar cada grupo por número de discurso
  Object.values(agrupado).forEach(salas => {
    Object.values(salas).forEach(asignaciones => {
      asignaciones.sort((a, b) => {
        const numA = parseInt(a.numero_discurso);
        const numB = parseInt(b.numero_discurso);
        return (isNaN(numA) ? 0 : numA) - (isNaN(numB) ? 0 : numB);
      });
    });
  });

  return agrupado;
};

 const agrupado = agruparPorSemanaYSala(asignaciones);


  const eliminarAsignacion = async (id: string) => {
    if (!window.confirm('¿Eliminar esta asignación?')) return;
    const { error } = await supabase.from('asignaciones').delete().eq('id', id);
    if (error) {
      setToastMensaje('Error al eliminar');
    } else {
      setToastMensaje('Asignación eliminada');
      fetchAsignaciones();
    }
    setShowToast(true);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Programación del Mes</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">

        {/* Filtros */}
        <IonGrid>
          <IonRow>
            <IonCol size="6">
              <IonItem>
                <IonLabel>Sala</IonLabel>
                <IonSelect value={salaFiltro} placeholder="Todas" onIonChange={e => setSalaFiltro(e.detail.value)}>
                  <IonSelectOption value="">Todas</IonSelectOption>
                  <IonSelectOption value="A">Sala A</IonSelectOption>
                  <IonSelectOption value="B">Sala B</IonSelectOption>
                </IonSelect>
              </IonItem>
            </IonCol>
            <IonCol size="6">
              <IonItem>
                <IonLabel>Mes</IonLabel>
                <IonDatetimeButton datetime="filtroMesSelector" />
              </IonItem>
              <IonModal keepContentsMounted={true}>
                <IonDatetime
                  id="filtroMesSelector"
                  presentation="month-year"
                  value={fechaFiltro}
                  onIonChange={e => setFechaFiltro(e.detail.value as string)}
                  showDefaultButtons={true}
                />
              </IonModal>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol size="12">
              <IonItem>
                <IonLabel>Vista</IonLabel>
                <IonSelect value={modoVista} onIonChange={e => setModoVista(e.detail.value)}>
                  <IonSelectOption value="mes">Mes</IonSelectOption>
                  <IonSelectOption value="semana">Semana</IonSelectOption>
                </IonSelect>
              </IonItem>
              <IonButton expand="block" className="ion-margin-top" onClick={fetchAsignaciones}>
                Buscar
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
        {/* Listado */}
        {asignaciones.length === 0 ? (
          <IonText className="ion-margin-top"><p style={{ textAlign: 'center' }}>No hay asignaciones.</p></IonText>
        ) : (
          Object.entries(agrupado).map(([semana, salas]) => (
            <div key={semana}>
              <h2>{semana}</h2>
              {Object.entries(salas).map(([sala, items]) => (
                <div key={sala}>
                  <h3 style={{ marginLeft: '1rem' }}>Sala {sala}</h3>
                  <IonGrid>
                    <IonRow>
                      {items.map(a => (
                        <IonCol size="12" sizeMd="6" sizeLg="4" key={a.id}>
                          <IonCard button onClick={() => { setAsignacionSeleccionada(a); setShowModal(true); }}>
                            <IonCardHeader>
                              <IonCardTitle>{a.encargado?.nombres} {a.encargado?.apellidos}</IonCardTitle>
                            </IonCardHeader>
                            <IonCardContent>
                              <p><strong>Ayudante:</strong> {a.ayudante?.nombres} {a.ayudante?.apellidos}</p>
                              <p><strong>Discurso:</strong> {a.numero_discurso}</p>
                              <p><strong>Fecha:</strong> {format(new Date(a.fecha), "dd 'de' MMMM yyyy", { locale: es })}</p>
                            </IonCardContent>
                          </IonCard>
                        </IonCol>
                      ))}
                    </IonRow>
                  </IonGrid>
                </div>
              ))}
            </div>
          ))
        )}

        {/* Modal para editar */}
        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Editar</IonTitle>
              <IonButtons slot="end"><IonButton onClick={() => setShowModal(false)}>Cerrar</IonButton></IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            {asignacionSeleccionada && (
              <>
                <IonItem>
                  <IonLabel>Encargado</IonLabel>
                  <IonSelect
                    value={asignacionSeleccionada.encargado?.id || ''}
                    onIonChange={e => setAsignacionSeleccionada((prev: any) => ({
                      ...prev,
                      encargado: alumnos.find(a => a.id === e.detail.value)
                    }))}
                  >
                    {alumnos.map(a => (
                      <IonSelectOption key={a.id} value={a.id}>{a.nombres} {a.apellidos}</IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>

                <IonItem>
                  <IonLabel>Ayudante</IonLabel>
                  <IonSelect
                    value={asignacionSeleccionada.ayudante?.id || ''}
                    onIonChange={e => setAsignacionSeleccionada((prev: any) => ({
                      ...prev,
                      ayudante: alumnos.find(a => a.id === e.detail.value)
                    }))}
                  >
                    <IonSelectOption value="">(Ninguno)</IonSelectOption>
                    {alumnos.map(a => (
                      <IonSelectOption key={a.id} value={a.id}>{a.nombres} {a.apellidos}</IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>

                <IonItem>
                  <IonLabel>Discurso</IonLabel>
                  <IonInput
                    value={asignacionSeleccionada.numero_discurso}
                    onIonChange={e => setAsignacionSeleccionada((prev: any) => ({
                      ...prev, numero_discurso: e.detail.value
                    }))}
                  />
                </IonItem>

                <IonItem>
                  <IonLabel>Fecha</IonLabel>
                  <IonDatetimeButton datetime="modalDatetime" />
                </IonItem>
                <IonModal keepContentsMounted={true}>
                  <IonDatetime
                    id="modalDatetime"
                    presentation="date"
                    value={asignacionSeleccionada.fecha}
                    onIonChange={e =>
                      setAsignacionSeleccionada((prev: any) => ({
                        ...prev,
                        fecha: e.detail.value,
                      }))
                    }
                    showDefaultButtons={true}
                  />
                </IonModal>

                <IonButton expand="block" onClick={async () => {
                  const { error } = await supabase.from('asignaciones')
                    .update({
                      encargado_id: asignacionSeleccionada.encargado?.id,
                      ayudante_id: asignacionSeleccionada.ayudante?.id || null,
                      numero_discurso: asignacionSeleccionada.numero_discurso,
                      fecha: asignacionSeleccionada.fecha.split('T')[0],
                    })
                    .eq('id', asignacionSeleccionada.id);
                  if (error) {
                    setToastMensaje('Error al guardar');
                  } else {
                    setToastMensaje('Cambios guardados');
                    setShowModal(false);
                    fetchAsignaciones();
                  }
                  setShowToast(true);
                }}>Guardar</IonButton>

                <IonButton expand="block" color="danger" onClick={() => {
                  eliminarAsignacion(asignacionSeleccionada.id);
                  setShowModal(false);
                }}>Eliminar</IonButton>
              </>
            )}
          </IonContent>
        </IonModal>

        <IonToast isOpen={showToast} message={toastMensaje} duration={2000} onDidDismiss={() => setShowToast(false)} />
      </IonContent>
    </IonPage>
  );
};

export default ProgramacionMensual;
