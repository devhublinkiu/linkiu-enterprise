<?php

use App\Models\Associate;
use App\Models\Conversation;
use App\Models\MessageGroup;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function makeAssociateUser(string $company, string $nit): array
{
    $associate = Associate::create(['company_name' => $company, 'nit' => $nit]);
    $user = User::factory()->create(['associate_id' => $associate->id, 'role' => 'associate']);

    return [$associate, $user];
}

it('un asociado solo ve las conversaciones de su empresa', function () {
    [$assocA, $userA] = makeAssociateUser('Empresa A SAS', '900000001-1');
    [$assocB] = makeAssociateUser('Empresa B SAS', '900000002-2');
    $admin = User::factory()->create(['is_superadmin' => true]);

    $convA = Conversation::create(['associate_id' => $assocA->id, 'created_by' => $admin->id]);
    $convB = Conversation::create(['associate_id' => $assocB->id, 'created_by' => $admin->id]);

    expect($userA->can('view', $convA))->toBeTrue();
    expect($userA->can('view', $convB))->toBeFalse();   // aislamiento entre asociados
    expect($admin->can('view', $convA))->toBeTrue();
    expect($admin->can('view', $convB))->toBeTrue();
});

it('no se puede responder una conversacion cerrada', function () {
    [$assoc, $user] = makeAssociateUser('Empresa C SAS', '900000003-3');

    $open = Conversation::create(['associate_id' => $assoc->id, 'status' => 'open']);
    $closed = Conversation::create(['associate_id' => $assoc->id, 'status' => 'closed']);

    expect($user->can('reply', $open))->toBeTrue();
    expect($user->can('reply', $closed))->toBeFalse();
});

it('solo un admin administra grupos de mensajeria', function () {
    [, $associate] = makeAssociateUser('Empresa D SAS', '900000004-4');
    $admin = User::factory()->create(['is_superadmin' => true]);

    expect($admin->can('create', MessageGroup::class))->toBeTrue();
    expect($associate->can('create', MessageGroup::class))->toBeFalse();
});
