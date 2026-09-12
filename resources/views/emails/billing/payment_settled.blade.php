@extends('emails._layout', ['title' => 'Pago recibido'])

@section('content')
    <p>Hola,</p>
    <p>Registramos tu pago y tu suscripción en <strong>CAMEP</strong> quedó al día.</p>

    <div class="plan-box">
        @if ($invoice)
            <p class="data-row"><strong>Concepto:</strong> {{ $invoice->period }}</p>
        @endif
        <p class="data-row"><strong>Monto:</strong> ${{ number_format((float) $payment->amount, 0, ',', '.') }}</p>
        <p class="data-row"><strong>Medio de pago:</strong> {{ $payment->methodLabel() }}</p>
        @if ($payment->reference)
            <p class="data-row"><strong>Referencia:</strong> {{ $payment->reference }}</p>
        @endif
        <p class="data-row"><strong>Fecha del pago:</strong> {{ optional($payment->paid_at)->format('d/m/Y') }}</p>
        <p class="data-row"><strong>Tu suscripción va hasta:</strong> {{ $newExpiration->format('d/m/Y') }}</p>
    </div>

    <p>Tu perfil sigue visible en el directorio público y conservas todos los beneficios de tu plan.</p>

    <div style="text-align: center;">
        <a href="{{ route('associate.company.billing') }}" class="btn">Ver mi facturación</a>
    </div>
@endsection
