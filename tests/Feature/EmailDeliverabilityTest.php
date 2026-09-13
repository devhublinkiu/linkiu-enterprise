<?php

use App\Listeners\EnsureEmailPlainText;
use App\Mail\WelcomeUser;
use App\Models\User;
use Illuminate\Mail\Events\MessageSending;
use Illuminate\Support\Facades\Mail;
use Symfony\Component\Mime\Email;

it('deriva una parte de texto plano cuando el correo es solo HTML', function () {
    $email = (new Email)->html(
        '<p>Hola <strong>mundo</strong></p><p>Segunda línea</p>'
    );

    (new EnsureEmailPlainText)->handle(new MessageSending($email));

    expect($email->getTextBody())->not->toBeNull()
        ->and($email->getTextBody())->toContain('Hola mundo')
        ->and($email->getTextBody())->toContain('Segunda línea');
});

it('respeta un text/plain ya presente', function () {
    $email = (new Email)->html('<p>Hola</p>')->text('Texto original');

    (new EnsureEmailPlainText)->handle(new MessageSending($email));

    expect($email->getTextBody())->toBe('Texto original');
});

it('todo envío lleva Reply-To global y parte de texto plano', function () {
    Mail::to('dest@example.com')->send(new WelcomeUser(new User(['name' => 'Ana'])));

    $messages = Mail::getSymfonyTransport()->messages();
    expect($messages)->toHaveCount(1);

    /** @var Email $email */
    $email = $messages->first()->getOriginalMessage();

    expect($email->getTextBody())->not->toBeNull();

    $replyTo = $email->getReplyTo();
    expect($replyTo)->not->toBeEmpty()
        ->and($replyTo[0]->getAddress())->toBe('adminfin@camepg.org');
});
