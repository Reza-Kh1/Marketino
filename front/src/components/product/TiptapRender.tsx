import { generateHTML } from '@tiptap/html';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import YouTube from '@tiptap/extension-youtube';
import { Table } from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Image from '@tiptap/extension-image';
import { Details, DetailsSummary, DetailsContent } from '@tiptap/extension-details';
import UniqueID from '@tiptap/extension-unique-id';
import { TableOfContents, getHierarchicalIndexes } from '@tiptap/extension-table-of-contents';
import ShowMoreContent from './ShowMoreContent';
import './../inputs/editor.css'
export const tiptapExtensions = [
    UniqueID.configure({
        types: ['heading', 'paragraph'],
        attributeName: 'id',
    }),
    TableOfContents.configure({
        getIndex: getHierarchicalIndexes,
    }),
    StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        code: {
            HTMLAttributes: {
                class: 'rounded-xl border bg-admin-primary/10 px-1.5 py-1 font-mono text-sm',
            },
        },
    }),
    TextAlign.configure({ types: ['heading', 'paragraph'], defaultAlignment: 'right' }),
    Image.configure({
        HTMLAttributes: { class: 'mx-auto rounded-lg max-w-full my-4' },
    }),
    YouTube,
    Table.configure({ resizable: false, HTMLAttributes: { class: 'tableWrapper' } }),
    TableCell,
    TableHeader,
    TableRow,
    TextStyle,
    Color,
    Highlight.configure({ multicolor: true }),
    TaskList,
    TaskItem.configure({ nested: true }),
    Subscript,
    Superscript,
    Details.configure({ HTMLAttributes: { class: 'details-block' } }),
    Details.extend({
        renderHTML() {
            return ['details', { class: 'details-block' }, 0];
        },
    }),
    DetailsSummary.extend({
        renderHTML() {
            return ['summary', { class: 'details-summary' }, 0];
        },
    }),
    DetailsContent.extend({
        renderHTML() {
            return ['div', { class: 'details-content' }, 0];
        },
    }),
];

interface RichContentViewerProps {
    content: unknown;
    className?: string;
}

const EMPTY_DOC = { type: 'doc', content: [] as unknown[] };
export function extractHeadings(content: unknown): { id: string; level: number; text: string }[] {
    let json: any = content;
    if (typeof json === 'string') {
        try {
            json = JSON.parse(json);
        } catch {
            return [];
        }
    }
    if (!json || typeof json !== 'object') return [];

    const headings: { id: string; level: number; text: string }[] = [];

    const walk = (node: any) => {
        if (!node) return;
        if (node.type === 'heading' && node.attrs?.id) {
            const text = (node.content ?? [])
                .filter((c: any) => c.type === 'text')
                .map((c: any) => c.text)
                .join('');
            headings.push({ id: node.attrs.id, level: node.attrs.level ?? 1, text });
        }
        (node.content ?? []).forEach(walk);
    };
    walk(json);

    return headings;
}

export default function RichContentViewer({ content, className }: RichContentViewerProps) {
    let json: any = content;
    const headings = extractHeadings(content);
    if (typeof json === 'string') {
        try {
            json = JSON.parse(json);
        } catch {
            json = EMPTY_DOC;
        }
    }

    if (!json || typeof json !== 'object' || json.type !== 'doc') {
        json = EMPTY_DOC;
    }

    let html = '';
    try {
        html = generateHTML(json, tiptapExtensions);
        html = html.replace(/data-id="([^"]+)"/g, 'id="$1" data-id="$1"');
    } catch (error) {
        console.error('خطا در تبدیل محتوای TipTap به HTML:', error);
        html = '<p>محتوای این بخش در حال حاضر قابل نمایش نیست.</p>';
    }


    return (
        <>
            {headings.length > 0 && (
                <nav aria-label="فهرست مطالب" className="mb-4 rounded-lg border p-3 text-sm">
                    <strong className="block mb-1">فهرست مطالب</strong>
                    <ul className="space-y-1">
                        {headings.map((h) => (
                            <li key={h.id} style={{ paddingInlineStart: `${(h.level - 1) * 12}px` }}>
                                <a href={`#${h.id}`} className="text-primary hover:underline">{h.text}</a>
                            </li>
                        ))}
                    </ul>
                </nav>
            )}
            <ShowMoreContent>
                <div
                    className={`tiptap ProseMirror prose dark:prose-invert max-w-none text-right leading-relaxed ${className ?? ''}`}
                    dangerouslySetInnerHTML={{ __html: html }}
                />
            </ShowMoreContent>
        </>
    );
}
