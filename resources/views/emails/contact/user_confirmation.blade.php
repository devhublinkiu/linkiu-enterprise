<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; }
        .header { border-bottom: 1px solid #888; padding-bottom: 20px; margin-bottom: 20px; text-align: center; }
        .header h1 { color: #151515; margin: 0; font-size: 24px; font-weight: bold; }
        .footer { margin-top: 30px; font-size: 13px; color: #666; border-top: 1px solid #eee; padding-top: 20px; text-align: center; }
        .footer-no-reply { font-style: italic; color: #999; margin-bottom: 16px; font-weight: normal; font-size: 10px; text-align: justify; }
        .footer-links { margin-bottom: 15px; line-height: 2; }
        .footer-links a { color: #504ac5ff; text-decoration: none; font-weight: normal; }
        .footer-links span { color: #ccc; margin: 0 10px; }
        .footer-info { padding-top: 15px; font-size: 12px; color: #888; border-top: 1px solid #f9f9f9; }
        .footer-copyright { font-size: 11px; color: #aaa; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div style="text-align: center; margin-bottom: 20px;">
                <img src="{{ asset('images/camep/logo_camep_horizontal_correos_header.png') }}" alt="CAMEP Logo" style="max-width: 200px; height: auto;">
            </div>
            <h1>¡Hemos recibido tu mensaje!</h1>
        </div>
        
        <div class="content">
            <p>Hola, <strong>{{ $submission->full_name }}</strong>,</p>
            <p>Gracias por ponerte en contacto con nosotros. Hemos recibido tu solicitud sobre <strong>"{{ $submission->service }}"</strong> y estamos revisándola cuidadosamente.</p>
            <p>Nuestro equipo de CAMEP se pondrá en contacto contigo lo antes posible a través de este correo electrónico o el teléfono registrado.</p>
            
            <p>Resumen de tu mensaje:</p>
            <blockquote style="background: #f9f9f9; padding: 15px; border-left: 5px solid #DD301B; font-style: italic;">
                "{{ $submission->message }}"
            </blockquote>
        </div>

        <div class="footer">            
            <div class="footer-links">
                <a href="mailto:adminfin@camepg.org">Equipo Financiero</a>
                <span>•</span>
                <a href="mailto:afiliate@camepg.org">Dep. de Auditoría</a>
                <span>•</span>
                <a href="mailto:procesosjuridicos@camepg.org">Atencion Legal</a>
                <span>•</span>
                <a href="mailto:protecciondedatos@camepg.org">Proteccion de Datos</a>
                <span>•</span>
                <br>
                <a href="mailto:soporte.camep@linkiu.bio">Soporte y Tickets</a>
                <span>•</span>
                <a href="https://camepg.org" target="_blank">www.camepg.org</a>
                <span>•</span>
                <a href="https://wa.me/573507880664" target="_blank">Línea de WhatsApp</a>
            </div>

            <div class="footer-info">
                <p>MZ 8 CA 813 APTO 202 FLOR AMARILLO | Puerto Gaitán - Meta</p>
                <p class="footer-no-reply">Este es un mensaje automático. Por favor, no respondas a este correo. <br>El contenido de este mensaje puede ser informacion privilegiada y confidencial. Si usted no es el destinatario real del mismo, por favor informe de ello a quien lo envia y destruyalo en forma inmediata. Esta prohibida su retencion, grabacion, utilizacion o divulgacion con cualquier proposito. Este mensaje ha sido verificado con software antivirus, en consecuencia, el remitente de este no se hace responsable por la presencia en el o en sus anexos de algun virus que pueda generar daños en los equipos o programas del destinatario.</p>
                <div class="footer-copyright">
                    © {{ date('Y') }} CAMEP | Un servicio de <a href="https://linkiu.bio" style="color: #aaa; text-decoration: underline;">Linkiu</a> | Todos los derechos reservados.
                </div>
            </div>
        </div>
    </div>
</body>
</html>
