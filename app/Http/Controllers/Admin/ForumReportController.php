<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ForumReport;
use App\Models\ForumTopic;
use App\Models\ForumReply;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ForumReportController extends Controller
{
    public function index()
    {
        $reports = ForumReport::with(['user', 'topic.user', 'reply.user'])
            ->latest()
            ->get();

        return Inertia::render('Admin/Forums/Reports/Index', [
            'reports' => $reports,
        ]);
    }

    public function dismiss(ForumReport $report)
    {
        $report->update(['status' => 'dismissed']);
        return back()->with('success', 'Reporte desestimado correctamente');
    }

    public function takeAction(Request $request, ForumReport $report)
    {
        // Handle deletion or locking
        if ($request->action === 'delete') {
            if ($report->topic_id) {
                ForumTopic::find($report->topic_id)?->delete();
            } elseif ($report->reply_id) {
                ForumReply::find($report->reply_id)?->delete();
            }
            $report->update(['status' => 'reviewed']);
            return back()->with('success', 'Contenido eliminado y reporte cerrado');
        }

        if ($request->action === 'lock' && $report->topic_id) {
            ForumTopic::find($report->topic_id)?->update(['is_locked' => true]);
            $report->update(['status' => 'reviewed']);
            return back()->with('success', 'Hilo bloqueado y reporte cerrado');
        }

        return back()->with('error', 'Acción no válida');
    }
}
