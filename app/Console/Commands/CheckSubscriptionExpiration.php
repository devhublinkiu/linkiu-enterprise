<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class CheckSubscriptionExpiration extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'subscription:check-expiration';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Checks for expired associate subscriptions and hides their public profiles after grace period.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking for expired associate subscriptions...');

        $associates = \App\Models\Associate::where('is_public', true)
            ->whereNotNull('plan_id')
            ->whereNotNull('plan_expires_at')
            ->get();

        $count = 0;
        foreach ($associates as $associate) {
            // isSubscriptionActive() already considers grace_days via the relationship
            if (!$associate->isSubscriptionActive()) {
                $associate->update(['is_public' => false]);
                $this->info("[-] Associate '{$associate->company_name}' has expired. Profile hidden.");
                $count++;
            }
        }

        $this->info("Done! {$count} associates were hidden.");
    }
}
