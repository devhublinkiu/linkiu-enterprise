@extends('emails._layout', ['title' => 'Comprobante por revisar'])

@section('content')
    <p>Un asociado subió un comprobante de transferencia y está esperando revisión.</p>

    <div class="warn-box">
        <p class="data-row"><strong>Asociado:</strong> {{ $payment->associate?->company_name ?? '—' }}</p>
        @if ($invoice)
            <p class="data-row"><strong>Concepto:</strong> {{ $invoice->period }}</p>
        @endif
        <p class="data-row"><strong>Monto:</strong> ${{ number_format((float) $payment->amount, 0, ',', '.') }}</p>
        <p class="data-row"><strong>Enviado:</strong> {{ optional($payment->created_at)->format('d/m/Y H:i') }}</p>
        @if ($payment->notes)
            <p class="data-row"><strong>Nota del asociado:</strong> {{ $payment->notes }}</p>
        @endif
    </div>

    <p>Mientras no se apruebe, la factura sigue pendiente y la suscripción no avanza.</p>

    <div style="text-align: center;">
        <a href="{{ route('admin.payments.index') }}" class="btn">Revisar el comprobante</a>
    </div>
@endsection
