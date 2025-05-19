export interface ConfiguracionNotificacion {
    id_empresa: string;
    mensajePlantilla: string;
    envioAutomatico: boolean;
    horasAnticipacion: number;
    canalesPermitidos: {
      whatsapp: boolean;
      email: boolean;
      sms: boolean;
    };
}
  