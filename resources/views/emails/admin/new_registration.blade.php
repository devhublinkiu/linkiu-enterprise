@extends('emails._layout', ['title' => 'Nuevo registro'])

@section('content')
    <p>Se registró un nuevo usuario en la plataforma de <strong>CAMEP</strong>:</p>

    <div class="data-row"><strong>Nombre:</strong> {{ $user->name }}</div>
    <div class="data-row"><strong>Correo:</strong> {{ $user->email }}</div>
    <div class="data-row"><strong>Fecha:</strong> {{ $user->created_at?->format('d/m/Y H:i') }}</div>

    <p style="margin-top: 20px;">El usuario continuará con el proceso de afiliación y facturación.</p>
@endsection
