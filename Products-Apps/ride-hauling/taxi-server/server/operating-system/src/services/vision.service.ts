export class VisionService {
  /**
   * Mock vision processing. 
   * In a real OS, this would call a model like llava or gpt-4o-vision.
   */
  static async analyze(base64Image: string, prompt: string): Promise<string> {
    console.log('[VisionService] Analyzing image...');
    
    // Simple heuristic for PoC:
    // If the prompt mentions "where" and there's an image, assume it's a location check.
    if (prompt.toLowerCase().includes('where') || prompt.toLowerCase().includes('here')) {
      return "The image shows a distinctive commercial building with a 'GoomTaxi' signage in the background, likely a designated pickup point.";
    }

    if (prompt.toLowerCase().includes('package') || prompt.toLowerCase().includes('what')) {
      return "The image shows a medium-sized cardboard box, approximately 2kg, wrapped in brown tape.";
    }

    return "A high-resolution image of the user's current surroundings.";
  }
}
