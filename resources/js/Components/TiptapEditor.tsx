import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Youtube from '@tiptap/extension-youtube';
import Underline from '@tiptap/extension-underline';
import { 
    Bold, 
    Italic, 
    List, 
    ListOrdered, 
    Quote, 
    Undo, 
    Redo, 
    Link as LinkIcon, 
    ImageIcon,
    Youtube as YoutubeIcon,
    Heading1,
    Heading2,
    Underline as UnderlineIcon,
    Loader2
} from 'lucide-react';
import { useRef, useState } from 'react';
import axios from 'axios';

interface TiptapEditorProps {
    content: string;
    onChange: (content: string) => void;
}

const MenuBar = ({ editor, onImageUpload }: { editor: any, onImageUpload: () => void }) => {
    if (!editor) return null;

    const setLink = () => {
        const url = window.prompt('URL del enlace');
        if (url) {
            editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
        }
    };

    const addYoutubeVideo = () => {
        const url = window.prompt('URL de YouTube');
        if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run();
    };

    return (
        <div className="flex flex-wrap gap-1 p-2 border-b border-slate-200 bg-slate-50 rounded-t-xl sticky top-0 z-10">
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('bold') ? 'bg-slate-200' : ''}`}
            >
                <Bold size={16} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('italic') ? 'bg-slate-200' : ''}`}
            >
                <Italic size={16} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('underline') ? 'bg-slate-200' : ''}`}
            >
                <UnderlineIcon size={16} />
            </button>
            <div className="w-px h-6 bg-slate-300 mx-1 self-center" />
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('heading', { level: 1 }) ? 'bg-slate-200' : ''}`}
            >
                <Heading1 size={16} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('heading', { level: 2 }) ? 'bg-slate-200' : ''}`}
            >
                <Heading2 size={16} />
            </button>
            <div className="w-px h-6 bg-slate-300 mx-1 self-center" />
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('bulletList') ? 'bg-slate-200' : ''}`}
            >
                <List size={16} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('orderedList') ? 'bg-slate-200' : ''}`}
            >
                <ListOrdered size={16} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('blockquote') ? 'bg-slate-200' : ''}`}
            >
                <Quote size={16} />
            </button>
            <div className="w-px h-6 bg-slate-300 mx-1 self-center" />
            <button type="button" onClick={setLink} className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('link') ? 'bg-slate-200' : ''}`}>
                <LinkIcon size={16} />
            </button>
            <button type="button" onClick={onImageUpload} className="p-2 rounded hover:bg-slate-200">
                <ImageIcon size={16} />
            </button>
            <button type="button" onClick={addYoutubeVideo} className="p-2 rounded hover:bg-slate-200">
                <YoutubeIcon size={16} />
            </button>
            <div className="flex-1" />
            <button type="button" onClick={() => editor.chain().focus().undo().run()} className="p-2 rounded hover:bg-slate-200">
                <Undo size={16} />
            </button>
            <button type="button" onClick={() => editor.chain().focus().redo().run()} className="p-2 rounded hover:bg-slate-200">
                <Redo size={16} />
            </button>
        </div>
    );
};

export default function TiptapEditor({ content, onChange }: TiptapEditorProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Link.configure({ 
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-indigo-600 underline cursor-pointer',
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-xl shadow-lg max-w-full h-auto my-8 mx-auto block',
                },
            }),
            Youtube.configure({ width: 840, height: 480 }),
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl m-5 focus:outline-none min-h-[300px] max-w-none editor-content',
            },
        },
    });

    const triggerImageUpload = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !editor) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await axios.post(route('admin.blog.upload-image'), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.url) {
                editor.chain().focus().setImage({ src: response.data.url }).run();
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Error al subir la imagen. Por favor, inténtalo de nuevo.');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-slate-900 focus-within:border-slate-900 transition-all bg-white min-h-[400px] relative overflow-hidden">
            <style>{`
                .editor-content a {
                    color: #4f46e5 !important;
                    text-decoration: underline !important;
                    font-weight: 600;
                }
                .editor-content img {
                    display: block;
                    margin-left: auto;
                    margin-right: auto;
                }
            `}</style>
            
            <MenuBar editor={editor} onImageUpload={triggerImageUpload} />
            
            {isUploading && (
                <div className="absolute inset-0 bg-white/50 z-20 flex items-center justify-center backdrop-blur-[1px]">
                    <div className="bg-white p-4 rounded-xl shadow-xl flex items-center gap-3 border border-slate-100">
                        <Loader2 className="animate-spin text-indigo-600" size={20} />
                        <span className="text-sm font-bold text-slate-700">Subiendo imagen...</span>
                    </div>
                </div>
            )}
            
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange}
            />
            
            <EditorContent editor={editor} />
        </div>
    );
}
