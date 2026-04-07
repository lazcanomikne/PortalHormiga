namespace PortalGovi.Models
{
    /// <summary>
    /// Modelo para representar la información complementaria de un producto de cotización
    /// </summary>
    public class CotizacionProductoInformacionComplementaria
    {
        /// <summary>
        /// ID único de la información complementaria
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// ID del producto de cotización
        /// </summary>
        public int IdCotizacionProducto { get; set; }

        /// <summary>
        /// Seguridad carnet identificación
        /// </summary>
        public bool? SeguridadCarnetIdentificacion { get; set; }

        /// <summary>
        /// Examen médico
        /// </summary>
        public bool? ExamenMedico { get; set; }

        /// <summary>
        /// Curso de seguridad
        /// </summary>
        public bool? CursoSeguridad { get; set; }

        /// <summary>
        /// Bomberos
        /// </summary>
        public bool? Bomberos { get; set; }

        /// <summary>
        /// Supervisor de seguridad
        /// </summary>
        public bool? SupervisorSeguridad { get; set; }

        /// <summary>
        /// Permisos de altura
        /// </summary>
        public bool? PermisosAltura { get; set; }

        /// <summary>
        /// Permisos de soldar
        /// </summary>
        public bool? PermisosSoldar { get; set; }

        /// <summary>
        /// Tarjeta foránea IMSS
        /// </summary>
        public bool? TarjetaForaneaImss { get; set; }

        /// <summary>
        /// AFIL 15
        /// </summary>
        public bool? Afil15 { get; set; }

        /// <summary>
        /// Sanitarios clientes
        /// </summary>
        public bool? SanitariosClientes { get; set; }

        /// <summary>
        /// Sanitarios rentados
        /// </summary>
        public bool? SanitariosRentados { get; set; }

        /// <summary>
        /// Área de resguardo de herramienta
        /// </summary>
        public bool? AreaResguardoHerramienta { get; set; }

        /// <summary>
        /// Comprobantes de pago personal IMSS
        /// </summary>
        public bool? ComprobantesPagoPersonalImss { get; set; }

        /// <summary>
        /// Equipo de protección personal
        /// </summary>
        public bool? EquipoProteccionPersonal { get; set; }

        /// <summary>
        /// Constancia de habilidades laborales DC3
        /// </summary>
        public bool? ConstanciaHabilidadesLaboralesDc3 { get; set; }

        /// <summary>
        /// Pláticas de seguridad impartidas
        /// </summary>
        public bool? PlaticasSeguridadImpartidas { get; set; }

        /// <summary>
        /// Exámenes médicos
        /// </summary>
        public bool? ExamenesMedicos { get; set; }

        /// <summary>
        /// Permiso de trabajo
        /// </summary>
        public bool? PermisoTrabajo { get; set; }

        /// <summary>
        /// Análisis de riesgo
        /// </summary>
        public bool? AnalisisRiesgo { get; set; }

        /// <summary>
        /// Permiso de trabajo espacios confinados
        /// </summary>
        public bool? PermisoTrabajoEspaciosConfinados { get; set; }

        /// <summary>
        /// Permiso de trabajos eléctricos
        /// </summary>
        public bool? PermisoTrabajosElectricos { get; set; }

        /// <summary>
        /// Técnico de seguridad
        /// </summary>
        public bool? TecnicoSeguridad { get; set; }

        /// <summary>
        /// Extintores en área de trabajo
        /// </summary>
        public bool? ExtintoresAreaTrabajo { get; set; }

        /// <summary>
        /// Lonas para trabajos en altura
        /// </summary>
        public bool? LonasTrabajosAltura { get; set; }

        /// <summary>
        /// Lona antichispas
        /// </summary>
        public bool? LonaAntichispas { get; set; }

        /// <summary>
        /// Oficina móvil
        /// </summary>
        public bool? OficinaMovil { get; set; }

        /// <summary>
        /// Ambulancia
        /// </summary>
        public bool? Ambulancia { get; set; }

        /// <summary>
        /// Cuota sindical
        /// </summary>
        public bool? CuotaSindical { get; set; }

        /// <summary>
        /// Set de refacciones
        /// </summary>
        public bool? SetRefacciones { get; set; }

        /// <summary>
        /// Estudio topográfico
        /// </summary>
        public bool? EstudioTopografico { get; set; }

        /// <summary>
        /// Observaciones
        /// </summary>
        public string Observaciones { get; set; }
    }
}
