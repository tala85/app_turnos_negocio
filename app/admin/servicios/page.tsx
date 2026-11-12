"use client";

import AdminHeader from "@/components/admin/AdminHeader";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import ServicioForm from "@/components/servicios/ServicioForm";
import ServiciosFiltros from "@/components/servicios/ServiciosFiltros";
import ServiciosLista from "@/components/servicios/ServiciosLista";
import { Toaster } from "@/lib/admin/useToast";
import { useTema } from "@/lib/admin/tema";
import { useServicios } from "@/features/servicios/useServicios";
import { duracionTexto, money } from "@/features/servicios/utils";

export default function AdminServiciosPage() {
  const tema = useTema();
  const s = useServicios();

  return (
    <div
      className={`min-h-screen ${tema.bg} ${tema.texto} transition-colors duration-300`}
    >
      <div className="mx-auto max-w-5xl px-3 pb-28 pt-4 sm:px-6 sm:pb-10 sm:pt-8">
        <AdminHeader
          tema={tema}
          icono="💅"
          titulo="Gestión de Servicios"
          subtitulo="Agregá, editá o eliminá los servicios"
          links={[
            {
              href: "/admin/reservas",
              label: "Reservas",
              icono: "📋",
              color: "emerald",
            },
            {
              href: "/admin/horarios",
              label: "Horarios",
              icono: "🕒",
              color: "blue",
            },
            {
              href: "/admin/combos",
              label: "Combos",
              icono: "🎁",
              color: "purple",
            },
            {
              href: "/admin/configuracion",
              label: "Personalización",
              icono: "🎨",
              color: "fuchsia",
            },
          ]}
        />

        <ServicioForm
          tema={tema}
          editando={s.editando}
          datos={s.formDatos}
          setDatos={s.setFormDatos}
          valido={s.formValido}
          guardando={s.guardando}
          visible={s.formVisible}
          setVisible={s.setFormVisible}
          onSubmit={s.guardar}
          onCancelar={s.cancelarEdicion}
          formRef={s.formRef}
          nombreRef={s.nombreRef}
        />

        <ServiciosFiltros
          tema={tema}
          total={s.servicios.length}
          activos={s.activos}
          inactivos={s.inactivos}
          visibles={s.visibles.length}
          busqueda={s.busqueda}
          setBusqueda={s.setBusqueda}
          filtro={s.filtro}
          setFiltro={s.setFiltro}
          orden={s.orden}
          setOrden={s.setOrden}
          onLimpiar={s.limpiarFiltros}
        />

        <ServiciosLista
          tema={tema}
          cargando={s.cargando}
          error={s.error}
          total={s.servicios.length}
          visibles={s.visibles}
          busyId={s.busyId}
          onReintentar={s.reintentar}
          onNuevo={s.nuevo}
          onLimpiarFiltros={s.limpiarFiltros}
          onEditar={s.editar}
          onToggle={s.toggleActivo}
          onEliminar={s.setAEliminar}
        />
      </div>

      <button
        type="button"
        onClick={s.nuevo}
        aria-label="Agregar nuevo servicio"
        className={`fixed bottom-5 right-4 z-40 grid h-14 w-14 place-items-center rounded-full text-2xl md:hidden ${tema.btnPrimario}`}
      >
        ＋
      </button>

      <ConfirmDialog
        abierto={Boolean(s.aEliminar)}
        tema={tema}
        titulo="¿Eliminar servicio?"
        advertencia="Vas a poder deshacer esta acción desde el aviso que aparece en pantalla."
        cargando={s.eliminando}
        onConfirmar={s.confirmarEliminar}
        onCancelar={s.cancelarEliminar}
      >
        {s.aEliminar && (
          <>
            Vas a eliminar{" "}
            <strong className={tema.texto}>
              &ldquo;{s.aEliminar.nombre}&rdquo;
            </strong>{" "}
            ({duracionTexto(s.aEliminar.duracion_min)} ·{" "}
            {money(s.aEliminar.precio)}). Dejará de aparecer en la página de
            reservas.
          </>
        )}
      </ConfirmDialog>

      <Toaster toast={s.toast} onCerrar={s.cerrarToast} />
    </div>
  );
}
