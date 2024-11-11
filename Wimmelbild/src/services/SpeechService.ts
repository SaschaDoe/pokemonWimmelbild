export class SpeechService {
    private readonly API_KEY = '00b45861dfe42d530590c7b60f36d307';
    private readonly API_URL = 'https://speechgen.io/index.php?r=api/text';
    private readonly EMAIL = 'saschadorflein@gmail.com';
    private readonly MAX_CHARS = 1900;

    async generateSpeech(text: string): Promise<string> {
        try {
            console.log('Generating speech for text:', text);
            
            const truncatedText = text.length > this.MAX_CHARS ? 
                text.substring(0, this.MAX_CHARS) : text;

            const formData = new FormData();
            formData.append('token', this.API_KEY);
            formData.append('email', this.EMAIL);
            formData.append('voice', 'Christoph');
            formData.append('text', truncatedText);
            formData.append('format', 'mp3');
            formData.append('speed', '1.0');
            formData.append('pitch', '0');
            formData.append('emotion', 'good');
            formData.append('pause_sentence', '300');
            formData.append('pause_paragraph', '400');
            formData.append('bitrate', '48000');

            const response = await fetch(this.API_URL, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            console.log('API Response:', result);

            if (result.status === -1) {
                throw new Error(result.error || 'Speech generation failed');
            }

            if (result.status === 1 && result.file) {
                // Return the direct URL to the audio file
                return result.file;
            }

            throw new Error('Invalid response format');

        } catch (error: any) {
            console.error('Error generating speech:', error);
            throw error;
        }
    }
} 