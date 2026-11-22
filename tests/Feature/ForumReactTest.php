<?php

use App\Models\ForumCategory;
use App\Models\ForumReaction;
use App\Models\ForumReply;
use App\Models\ForumTopic;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

function frUser(): User
{
    $plan = Plan::create([
        'name' => 'Plan '.Str::random(5),
        'slug' => 'plan-'.Str::lower(Str::random(8)),
        'grace_days' => 0,
    ]);
    $user = User::factory()->create();

    test()->actingAs($user)->post(route('associate.company.save.draft'), [
        'company_name' => 'Asociada '.Str::random(5),
    ]);

    $user->fresh()->associate->update([
        'plan_id' => $plan->id,
        'plan_expires_at' => now()->addDays(10),
        'status' => 'approved',
    ]);

    return $user->fresh();
}

function frCategory(): ForumCategory
{
    return ForumCategory::create(['name' => 'General', 'slug' => 'general-'.Str::random(4)]);
}

function frTopic(User $user): ForumTopic
{
    return ForumTopic::create([
        'category_id' => frCategory()->id,
        'user_id' => $user->id,
        'title' => 'Tema '.Str::random(4),
        'slug' => 'tema-'.Str::random(6),
        'content' => 'contenido',
    ]);
}

it('valorar una respuesta marca la respuesta, no el tema del mismo número', function () {
    $user = frUser();
    $topic = frTopic($user);
    $reply = ForumReply::create([
        'topic_id' => $topic->id,
        'user_id' => $user->id,
        'content' => 'respuesta',
    ]);

    test()->actingAs($user)
        ->post(route('forums.react', ['reactable' => 'reply', 'type' => 'useful', 'id' => $reply->id]))
        ->assertRedirect();

    expect(ForumReaction::where('reactable_type', ForumReply::class)
        ->where('reactable_id', $reply->id)->where('type', 'useful')->exists())->toBeTrue();
    expect(ForumReaction::where('reactable_type', ForumTopic::class)->exists())->toBeFalse();
});

it('valorar un tema marca el tema', function () {
    $user = frUser();
    $topic = frTopic($user);

    test()->actingAs($user)
        ->post(route('forums.react', ['reactable' => 'topic', 'type' => 'useful', 'id' => $topic->id]))
        ->assertRedirect();

    expect(ForumReaction::where('reactable_type', ForumTopic::class)
        ->where('reactable_id', $topic->id)->exists())->toBeTrue();
});
