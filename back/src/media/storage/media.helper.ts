export function getMediaFolder(mimetype: string): string {
    if (mimetype.startsWith('image/')) return 'images';
    if (mimetype.startsWith('video/')) return 'videos';
    if (mimetype.startsWith('audio/')) return 'audios';
    if (mimetype === 'application/pdf') return 'documents';
    return 'files';
}

export function buildKey(mimetype: string, originalName: string): string {
    const ext = originalName.split('.').pop()?.toLowerCase() || 'bin';
    const base = originalName
        .split('.').slice(0, -1).join('.')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || 'file';
    const now = new Date();
    const date = `${now.getFullYear()}`;
    const month = `${String(now.getMonth() + 1).padStart(2, '0')}`
    const unique = `${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 9000 + 1000)}`;
    return `marketino/${'image'}/${date}/${month}/${base}-${unique}.${ext}`;
}