<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Slider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class SliderController extends Controller
{
    public function index()
    {
        return inertia('Admin/Sliders/Index', [
            'sliders' => Slider::orderBy('order')->get()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'image' => 'required|image|max:2048',
            'title' => 'nullable|string|max:255',
            'order' => 'integer'
        ]);

        $path = $request->file('image')->store('sliders', config('filesystems.default'));

        Slider::create([
            'image_path' => $path,
            'title' => $request->title,
            'order' => $request->order ?? 0,
            'is_active' => true
        ]);

        return back()->with('success', 'Slider creado exitosamente');
    }

    public function updateOrder(Request $request)
    {
        foreach ($request->orders as $id => $order) {
            Slider::where('id', $id)->update(['order' => $order]);
        }
        return back();
    }

    public function toggleStatus(Slider $slider)
    {
        $slider->update(['is_active' => !$slider->is_active]);
        return back();
    }

    public function destroy(Slider $slider)
    {
        Storage::disk(config('filesystems.default'))->delete($slider->image_path);
        $slider->delete();
        return back();
    }
}
