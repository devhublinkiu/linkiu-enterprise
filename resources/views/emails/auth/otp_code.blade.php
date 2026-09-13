@extends('emails._layout', ['title' => $purpose === 'password_reset' ? 'Recupera tu contraseña' : 'Verifica tu correo'])

@section('content')
    <p>Hola,</p>

    @if ($purpose === 'password_reset')
        <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>CAMEP</strong>.
            Usa este código para continuar:</p>
    @else
        <p>Gracias por registrarte en <strong>CAMEP</strong>. Usa este código para verificar tu correo:</p>
    @endif

    <div style="text-align: center; margin: 28px 0;">
        <span style="display: inline-block; font-size: 34px; font-weight: bold; letter-spacing: 10px;
                     color: #151515; background: #f7f7f7; border: 1px solid #eee; border-radius: 10px;
                     padding: 16px 24px;">{{ $code }}</span>
    </div>

    <p>El código vence en <strong>{{ $ttlMinutes }} minutos</strong>. No lo compartas con nadie.</p>
    <p style="color: #888; font-size: 13px;">Si no solicitaste esto, puedes ignorar este mensaje; tu cuenta sigue segura.</p>
@endsection
