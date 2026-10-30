import { Download, Paperclip } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

// Chip de adjunto descargable (nombre + tamaño). La URL va gateada por el backend.
export interface AttachmentProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    name: string;
    size?: number | null;
}

function humanSize(bytes?: number | null): string {
    if (!bytes) return '';
    const kb = bytes / 1024;
    return kb < 1024 ? `${Math.round(kb)} KB` : `${(kb / 1024).toFixed(1)} MB`;
}

export const Attachment = React.forwardRef<HTMLAnchorElement, AttachmentProps>(
    ({ name, size, className, ...props }, ref) => (
        <a
            ref={ref}
            className={cn(
                'inline-flex max-w-[260px] items-center gap-2.5 rounded-lg border bg-background px-3 py-2 text-xs transition-colors hover:bg-muted',
                className,
            )}
            {...props}
        >
            <span className="grid size-8 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
                <Paperclip className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-foreground">
                    {name}
                </span>
                {size ? (
                    <span className="text-muted-foreground">
                        {humanSize(size)}
                    </span>
                ) : null}
            </span>
            <Download className="size-4 shrink-0 text-muted-foreground" />
        </a>
    ),
);
Attachment.displayName = 'Attachment';
