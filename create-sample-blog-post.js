const { createClient } = require('@supabase/supabase-js')

// Direct configuration from .env.local
const supabaseUrl = 'https://epujffkujstgprcamgpi.supabase.co/'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwdWpmZmt1anN0Z3ByY2FtZ3BpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTA3MjgxMCwiZXhwIjoyMDc0NjQ4ODEwfQ.mStVJkfPaboEZ2n6P00A8nQKO9RlonwasZJTBxRUmf0'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const samplePost = {
  title: 'Jaka posadzka żywiczna do garażu? Praktyczny przewodnik dla inwestora',
  slug: 'jaka-posadzka-zywiczna-do-garazu-praktyczny-przewodnik',
  content: `
<article class="blog-article">
  <header>
    <p class="intro">Wyposażenie garażu nie kończy się na bramie czy oświetleniu — kluczowy wybór to także odpowiednia posadzka. 
    Coraz więcej właścicieli domów decyduje się na <strong>posadzki żywiczne</strong>, które łączą trwałość przemysłową z nowoczesnym wyglądem. 
    Zastanawiasz się, jaka będzie najlepsza? Sprawdź nasz poradnik i dowiedz się, jaką posadzkę wybrać — lub <a href="/valuation" class="cta-link">zamów bezpłatną wycenę w DecoSol</a>.</p>
  </header>

  <section>
    <h2>Dlaczego warto wybrać posadzkę żywiczną w garażu?</h2>
    <ul>
      <li>✅ <strong>Odporność na ścieranie, zabrudzenia i chemię warsztatową</strong> (olej, smary, sól drogową, płyny eksploatacyjne)</li>
      <li>✅ <strong>Bezspoinowa, gładka powierzchnia</strong> — łatwa w czyszczeniu i odporna na wodę</li>
      <li>✅ <strong>Personalizacja kolorów i efektów</strong> – satyna, połysk, mat</li>
      <li>✅ <strong>Możliwość dodania antypoślizgu</strong> np. z piasku kwarcowego</li>
      <li>✅ <strong>Trwałość nawet do 20 lat</strong> przy prawidłowej aplikacji</li>
    </ul>
  </section>

  <section>
    <h2>Rodzaje żywic do garażu – którą wybrać?</h2>
    <table class="resin-table">
      <thead>
        <tr>
          <th>Typ żywicy</th>
          <th>Wytrzymałość</th>
          <th>Elastyczność</th>
          <th>Odporność UV</th>
          <th>Cena</th>
          <th>Zastosowanie</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Epoksydowa</strong></td>
          <td>Bardzo wysoka</td>
          <td>Niska</td>
          <td>Słaba</td>
          <td>Przystępna</td>
          <td>Garaże, warsztaty, magazyny</td>
        </tr>
        <tr>
          <td><strong>Poliuretanowa</strong></td>
          <td>Wysoka</td>
          <td>Bardzo dobra</td>
          <td>Bardzo dobra</td>
          <td>Wyższa</td>
          <td>Garaże z wahaniami temperatur</td>
        </tr>
        <tr>
          <td><strong>Metakrylanowa</strong></td>
          <td>Bardzo wysoka</td>
          <td>Dobra</td>
          <td>Dobra</td>
          <td>Najwyższa</td>
          <td>Przemysł, szybkie remonty</td>
        </tr>
      </tbody>
    </table>

    <p>Najczęściej do garaży prywatnych stosuje się <strong>żywice epoksydowe</strong> – są sztywne, odporne na ścieranie i przystępne cenowo. 
    W nieogrzewanych lub chłodnych pomieszczeniach lepiej sprawdzą się <strong>żywice poliuretanowe</strong>. 
    Jeśli zależy Ci na czasie, postaw na <strong>metakrylan</strong> – gotowy do użytku już po kilku godzinach.</p>
  </section>

  <section>
    <h2>O czym pamiętać przed montażem?</h2>
    <ul>
      <li>Podłoże musi być <strong>czyste, suche i stabilne</strong></li>
      <li>Zmierz <strong>wilgotność metodą elektrodową</strong></li>
      <li>Napraw pęknięcia i ubytki przed aplikacją</li>
      <li>Grubość warstwy: minimum <strong>2–3 mm</strong></li>
      <li>Stosuj <strong>produkty renomowanych producentów</strong> (Sika, Mapei, Flowcrete)</li>
      <li>Powierz montaż <strong>profesjonalistom z doświadczeniem</strong></li>
    </ul>
  </section>

  <section>
    <h2>Pielęgnacja i konserwacja</h2>
    <p>Utrzymanie posadzki żywicznej w czystości to nic trudnego. Wystarczy regularne zamiatanie i mycie neutralnymi detergentami. 
    Unikaj agresywnych środków chemicznych i szczotek drucianych. 
    Raz na kilka miesięcy warto zastosować środek konserwujący, który odświeży połysk i wzmocni powierzchnię.</p>
  </section>

  <section class="highlight">
    <h2>Dlaczego warto wybrać <span class="brand">DecoSol</span>?</h2>
    <p><strong>DecoSol</strong> to firma specjalizująca się w wykonywaniu <strong>posadzek żywicznych dla klientów prywatnych</strong> oraz obiektów do 200 m². 
    Dzięki doświadczeniu przy realizacjach dla <strong>Rolex</strong> i <strong>Patek Philippe</strong> oferujemy jakość, której możesz zaufać.</p>

    <p>✔ Profesjonalne doradztwo<br>
    ✔ Wysokiej klasy materiały<br>
    ✔ Gwarancja trwałości<br>
    ✔ Bezpłatna wycena i pomiar</p>

    <a href="/valuation" class="cta-button">Zamów darmową wycenę</a>
  </section>

  <footer>
    <h3>Podsumowanie</h3>
    <p>Jeśli szukasz trwałego, estetycznego i nowoczesnego rozwiązania do garażu, <strong>posadzka żywiczna</strong> to inwestycja na lata. 
    Skontaktuj się z <a href="/contact">DecoSol</a> i sprawdź, jak możemy odmienić Twój garaż.</p>
  </footer>
</article>
`,
  excerpt: 'Kompletny przewodnik po wyborze posadzki żywicznej do garażu. Poznaj różnice między systemami epoksydowymi, poliuretanowymi i metakrylanowymi oraz czynniki, które należy wziąć pod uwagę przy wyborze.',
  featured_image: '/images/posadzka-zywiczna-garaz.jpg',
  category: 'porady-techniczne',
  tags: ['posadzki żywiczne', 'garaż', 'epoksyd', 'poliuretan', 'metakrylan', 'przewodnik'],
  status: 'published',
  published_at: new Date().toISOString(),
  reading_time_minutes: 5,
  is_featured: true,
  meta_title: 'Jaka posadzka żywiczna do garażu? Praktyczny przewodnik dla inwestora | DecoSol',
  meta_description: 'Zastanawiasz się, jaka posadzka żywiczna sprawdzi się w garażu? Poznaj różnice między epoksydową, poliuretanową i metakrylanową. Sprawdź ofertę DecoSol – darmowa wycena online!',
  meta_keywords: ['posadzka żywiczna do garażu', 'posadzki żywiczne', 'garażowa żywica', 'epoksydowa posadzka', 'poliuretanowa posadzka', 'DecoSol'],
  og_title: 'Jaka posadzka żywiczna do garażu? | DecoSol',
  og_description: 'Dowiedz się, jaką posadzkę żywiczną wybrać do garażu. Praktyczny przewodnik inwestora.',
  og_image: '/images/posadzka-zywiczna-garaz.jpg',
  canonical_url: 'https://decosol.pl/blog/jaka-posadzka-zywiczna-do-garazu-praktyczny-przewodnik'
}

async function createSamplePost() {
  console.log('Creating sample blog post...')
  
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .insert([samplePost])
      .select()
      .single()

    if (error) {
      console.error('Error creating sample post:', error)
      process.exit(1)
    }

    console.log('Sample blog post created successfully!')
    console.log('Post ID:', data.id)
    console.log('Post slug:', data.slug)
    console.log('Post title:', data.title)
    console.log('Visit: http://localhost:3000/blog/' + data.slug)

  } catch (error) {
    console.error('Unexpected error:', error)
    process.exit(1)
  }
}

createSamplePost()
