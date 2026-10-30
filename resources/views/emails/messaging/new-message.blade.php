<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nuevo mensaje de CAMEP</title>
</head>
<body style="margin:0; background:#f4f4f3; font-family:Arial, Helvetica, sans-serif; color:#151515;">
    <div style="max-width:560px; margin:0 auto; padding:28px 20px;">
        <div style="background:#ffffff; border:1px solid #e5e5e2; border-radius:14px; padding:28px;">
            <p style="margin:0 0 6px; font-size:12px; font-weight:bold; letter-spacing:1px; text-transform:uppercase; color:#6f6f6d;">
                CAMEP · Mensaje
            </p>
            <h1 style="margin:0 0 16px; font-size:20px; color:#151515;">Tienes un nuevo mensaje de CAMEP</h1>

            @if (! empty($subject))
                <p style="margin:0 0 10px; font-weight:bold;">{{ $subject }}</p>
            @endif

            <div style="background:#f6f6f4; border:1px solid #e5e5e2; border-radius:10px; padding:14px; color:#2a2a2a; font-size:15px; line-height:1.5;">
                {{ \Illuminate\Support\Str::limit($body, 600) }}
            </div>

            <a href="{{ $url }}" style="display:inline-block; margin-top:20px; background:#151515; color:#ffffff; text-decoration:none; font-weight:bold; font-size:14px; padding:12px 20px; border-radius:10px;">
                Ver mensaje
            </a>

            <p style="margin:22px 0 0; font-size:12px; color:#9a958d;">
                Recibes este correo porque CAMEP te escribió en tu bandeja interna.
            </p>
        </div>
    </div>
</body>
</html>
