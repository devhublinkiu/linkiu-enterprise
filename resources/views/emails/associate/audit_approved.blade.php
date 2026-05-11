<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; }
        .header { border-bottom: 1px solid #888; padding-bottom: 20px; margin-bottom: 20px; text-align: center; }
        .header h1 { color: #151515; margin: 0; font-size: 24px; font-weight: bold; }
        .approved-box { background: #f0fdf4; border: 1px solid #86efac; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .approved-box p { margin: 0; color: #15803d; font-weight: bold; }
        .footer { margin-top: 30px; font-size: 13px; color: #666; border-top: 1px solid #eee; padding-top: 20px; text-align: center; }
        .footer-no-reply { font-style: italic; color: #999; margin-bottom: 16px; font-weight: normal; font-size: 10px; text-align: justify; }
        .footer-links { margin-bottom: 15px; line-height: 2; }
        .footer-links a { color: #504ac5ff; text-decoration: none; font-weight: normal; }
        .footer-links span { color: #ccc; margin: 0 10px; }
        .footer-info { padding-top: 15px; font-size: 12px; color: #888; border-top: 1px solid #f9f9f9; }
        .footer-copyright { font-size: 11px; color: #aaa; }
        .btn { display: inline-block; background-image: linear-gradient(to right, #16a34a, #15803d); color: #ffffff !important; padding: 12px 25px; text-decoration: none; border-radius: 100px; font-weight: medium; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div style="text-align: center; margin-bottom: 20px;">
                <img src="{{ asset('images/camep/logo_camep_horizontal_correos_header.png') }}" alt="CAMEP Logo" style="max-width: 200px; height: auto;">
            </div>
            <h1>{{ $isChangeRequest ? 'Solicitud de Cambio Aprobada' : 'Sección Aprobada' }}</h1>
        </div>

        <div class="content">
            <p>Estimado equipo de <strong>{{ $associate->company_name }}</strong>,</p>

            @if($isChangeRequest)
                <p>Su solicitud de modificación de la sección <strong>{{ $sectionName }}</strong> ha sido aprobada. Ya puede ingresar a su panel y realizar los cambios necesarios.</p>
            @else
                <p>Nos complace informarle que la sección <strong>{{ $sectionName }}</strong> de su perfil ha sido revisada y aprobada por nuestro equipo.</p>
            @endif

            <div class="approved-box">
                <p>✓ Sección aprobada: {{ $sectionName }}</p>
            </div>

            <p>Continúe completando las demás secciones de su perfil para avanzar en el proceso de afiliación a CAMEP.</p>

            <div style="text-align: center;">
                <a href="{{ url('/my-company/basic-info') }}" class="btn">Ver mi perfil</a>
            </div>
        </div>

        <div class="footer">
            <div class="footer-links">
                <a href="mailto:adminfin@camepg.org">Equipo Financiero</a>
                <span>•</span>
                <a href="mailto:afiliate@camepg.org">Dep. de Auditoría</a>
                <span>•</span>
                <a href="mailto:procesosjuridicos@camepg.org">Atención Legal</a>
                <span>•</span>
                <a href="mailto:protecciondedatos@camepg.org">Protección de Datos</a>
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
                <p class="footer-no-reply">Este es un mensaje automático. Por favor, no respondas a este correo.</p>
                <div class="footer-copyright">
                    © {{ date('Y') }} CAMEP | Un servicio de <a href="https://linkiu.bio" style="color: #aaa; text-decoration: underline;">Linkiu</a> | Todos los derechos reservados.
                </div>
            </div>
        </div>
    </div>
</body>
</html>
