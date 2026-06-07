import React, { useState } from 'react';
import { 
  Wrench, Search as SearchIcon, Cpu, Zap, Activity, Info, 
  ShoppingBag, HelpCircle, Check, CheckCircle2, ShieldAlert, 
  AlertTriangle, Hammer, Sliders, ExternalLink, Play, Sparkles, MapPin, Gauge
} from 'lucide-react';
import { motion } from 'motion/react';

interface DiagnosticFault {
  id: string;
  title: string;
  symptom: string;
  cause: string;
  difficulty: 'Fácil' | 'Media' | 'Compleja';
  steps: string[];
  solution: string;
  estimatedTime: string;
}

export function PinballRevolucionGuide() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'info' | 'components' | 'faults' | 'maintenance' | 'parts' | 'tools'>('info');
  const [selectedFaultId, setSelectedFaultId] = useState<string | null>('no-enciente');
  const [completedSteps, setCompletedSteps] = useState<Record<string, Record<number, boolean>>>({});

  // Ficha técnica
  const technicalSpecs = {
    brand: "Pinball Revolución / Pinball de Ruleta de Fútbol",
    assembly: "Shengkun Tech Ltd. (Guangzhou) & Talleres de Integración Mecatrónica de América Latina (México, Honduras, Perú, Colombia)",
    mcu: "Shengkun Electronics STC89C52RC (Basado en arquitectura clásica MCS-51 optimizado de 8 bits)",
    displayType: "Displays de tubo LED de 7 segmentos multiplexados en serie con Shift Registers 74HC595D",
    powerSupplies: "Fuente arcade tri-voltaje de entrada conmutada (110V/220V AC a +5V DC @ 2A, +12V DC @ 5A, +24V/+36V DC @ 3A para solenoides)",
    solenoids: "Bobina eyectora principal de 24V DC con émbolo cromado de 19mm y diodo de derivación libre (Flyback) 1N4007 incorporado",
    sensors: "Optoacopladores de herradura de lectura infrarroja activa (Tx: LED IR, Rx: Fototransistor) con compuertas lógicas Schmitt Trigger para filtrado de falsos impulsos"
  };

  // Componentes Internos Detallados
  const componentCategories = [
    {
      title: "Tarjeta de Control Principal (Main PCB Yellow)",
      description: "La computadora principal de la máquina. Procesa las entradas de sensores ópticos de fútbol y coordina la lógica del juego, créditos y sonidos.",
      details: [
        "Procesador STC89C52 o clon militar de bajo costo.",
        "Potenciómetros integrados para calibración de dificultad de premio físico.",
        " DIP Switches de 8 posiciones para configurar valor de moneda (1, 2, 5, 10 créditos por moneda) y tasa de retorno.",
        "Transistores Darlington TIP122 montados sobre disipador de aluminio para manejar los eyectores de bobina."
      ],
      voltage: "Entrada estabilizada de +5V DC para procesador y +12V DC para amplificación de audio LM386."
    },
    {
      title: "Fuente Conmutada Arcade",
      description: "Cerebro energético. Convierte la corriente AC doméstica inestable de América Latina en líneas puras y rectificadas de voltaje continuo.",
      details: [
        "Potenciómetro de ajuste fino de +5V para evitar subidas o bajadas lógicas por calor.",
        "Entrada de voltaje manual por switch selector físico 115V / 230V.",
        "Protección integrada contra sobrecorriente del solenoide."
      ],
      voltage: "Salidas: +5V (Lógica), +12V (LEDs, Monedero, Sonido), +24V (Eyectores de Solenoide)."
    },
    {
      title: "Módulo Validador Multimoneda",
      description: "Monedero electrónico de comparación (generalmente CH-926 o GD-100). Escanea el metal usando inductores electromagnéticos de paso.",
      details: [
        "Capacidad de almacenar de 1 a 6 perfiles de monedas simultáneas.",
        "Sistema óptico de doble lectura infrarroja en la rampa de caída antirrobo/antihilos.",
        "Línea de pulso configurable de 20ms, 50ms o 100ms mediante switch mecánico posterior."
      ],
      voltage: "Alimentación estable de +12V DC. Corriente nominal: 50mA, Corriente de pico al validar: 350mA."
    },
    {
      title: "Arreglo del Solenoide Evector",
      description: "Bobina cilíndrica de cobre esmaltado encargada de relanzar la bola metálica (esfera pesada de 19mm) hacia el carrusel superior de la ruleta fútbol.",
      details: [
        "Cuerpo de bobina estándar con chaqueta plástica ignífuga.",
        "Varilla impulsora cromada con tapón amortiguador de caucho sintético en el extremo.",
        "Resorte de tracción helicoidal cónico para garantizar retorno ultra rápido sin atascos."
      ],
      voltage: "Pulso violento de +24V a +36V DC con duración calibrada en microcontrolador de 80ms a 120ms."
    }
  ];

  // Base de Datos de Fallas Técnicas (Exactas de Pinball Revolución)
  const technicalFaults: DiagnosticFault[] = [
    {
      id: "no-enciente",
      title: "La Máquina No Enciende y Queda Totalmente Muerta",
      symptom: "Sin luces en marquesina, displays apagados, bocinas no emiten zumbido, solenoide libre de tensión.",
      cause: "Fusible de entrada de red AC fundido en el receptáculo IEC hembra, o la etapa conmutadora de transistores de potencia de la fuente conmutada dañada por sobretensión.",
      difficulty: "Fácil",
      estimatedTime: "15 min",
      steps: [
        "Desconecte el cable de poder de la toma eléctrica de pared para garantizar seguridad.",
        "Ubique el conector de alimentación de la máquina. Utilice un destornillador plano plano pequeño para extraer la gaveta del portafusibles de seguridad.",
        "Realice prueba de continuidad con multímetro en el fusible de vidrio de 3A/250V (debe dar <1 Ohmio). Reemplace si está abierto.",
        "Si el fusible está sano, reconecte e inserte puntas del multímetro en las borneras de salida de la fuente metálica tipo colmena.",
        "Mida las terminales +5V, +12V y GND. Si marca 0V, gire el potenciómetro de ajuste de la fuente o desconecte PCB principal para verificar si la placa está cruzando la línea a tierra."
      ],
      solution: "Reemplazo del fusible de protección AC de entrada de 3.15 Amperios o calibración/reemplazo de la Fuente Conmutada de 150W Arcade ajustando la salida de +5V a exactamente +5.1V."
    },
    {
      id: "display-falla",
      title: "Displays de Puntaje Apagados, Parpadeando o Con Números Incoherentes",
      symptom: "El display central muestra caracteres incompletos ('88' roto, falta un segmento), parpadea al ritmo de la música, o no suma créditos generados.",
      cause: "Soldaduras frías y resquebrajadas en los terminales de los shift registers 74HC595, o daño estático severo en los transistores Darlington de multiplexado de dígitos.",
      difficulty: "Media",
      estimatedTime: "30 min",
      steps: [
        "Desmonte la placa del panel de vidrio protector aflojando los tornillos de retención plásticos.",
        "Revise visualmente con lupa buscando grietas en los pines de soldadura del conector plano ribbon IDC de 10 cables.",
        "Pruebe con multímetro en modo escala de diodos las uniones de los circuitos integrados de soldadura superficial SMD 74HC595.",
        "Suelde un cable puente si hay una pista rota o corroída por humedad ambiental típica de locales desatendidos.",
        "Observe si el chip integrado 74HC595 está levantando temperatura no habitual al encender la máquina."
      ],
      solution: "Resoldadura total de pines de displays tubulares y el reemplazo directo del registro de desplazamiento 74HC595. Se aconseja instalar un filtro de ferrita en el cable de datos IDC para amortiguar ruido electromagnético."
    },
    {
      id: "bola-atascada",
      title: "La Bola Metálica No Sale, Se Atasca Abajo o No Hay Lanzamiento",
      symptom: "Al presionar el disparador, se escucha el chasquido electromecánico pero la esfera de metal no sube a la pista de rueda.",
      cause: "Desgaste del muelle con resorte cónico de retorno, suciedad abrasiva acumulada dentro de la camisa de nylon de la bobina, o fatiga estructural del tope de caucho amortiguador.",
      difficulty: "Fácil",
      estimatedTime: "20 min",
      steps: [
        "Acceda al cajón eyector de la máquina en la parte inferior trasera levantando el tablero.",
        "Empuje manualmente el émbolo de metal para verificar fricción o atasco por resina o mugre.",
        "Desarme el solenoide retirando el anillo de retención tipo clip en E.",
        "Limpie a profundidad el interior de la camisa de plástico de la bobina utilizando alcohol isopropílico de alta pureza y un paño de microfibra.",
        "Revise la longitud de compresión del resorte cónico. Si está estirado o deformado, sustitúyalo."
      ],
      solution: "Limpieza profunda en seco del émbolo y de la camisa deslizable de nylon. ADVERTENCIA: Nunca añada WD-40, grasa grafitada ni aceites líquidos, ya que el polvo del ambiente generará una pasta pegajosa abrasiva que trabará el eyector en pocas semanas."
    },
    {
      id: "bobina-muerta",
      title: "Solenoides o Bobinas Lanzadoras No Disparan en Absoluto",
      symptom: "El juego procesa créditos correctamente, pero al momento preciso de expulsar la bola no existe ningún movimiento mecánico ni sonido de energización de bobina.",
      cause: "Transistor de potencia Darlington TIP122 abierto en la placa principal, fusible de la línea del solenoide (+24V) quemado o diodo rectificador de protección 1N4007 roto en cortocircuito.",
      difficulty: "Compleja",
      estimatedTime: "40 min",
      steps: [
        "Mida la tensión DC en los polos activos de la bobina eyectora. Debe marcar +24V DC permanentes referidos a tierra.",
        "Si hay 0V, verifique el fusible intermedio de 2A colocado bajo el tablero para la línea de alta potencia.",
        "Use el multímetro en prueba de diodos para verificar el diodo 1N4007 soldado en los bornes de la bobina. Si marca continuidad en ambos sentidos, está en corto completo.",
        "Desconecte la PCB principal con la máquina apagada. Busque el transistor TIP122 correspondiente a esa línea usando el esquema de pines.",
        "Mida la juntura base-emisor y colector-emisor del transistor TIP122. Un valor cercano a 0 marca un transistor quemado y en corto."
      ],
      solution: "Sustitución del transistor de conmutación TIP122 dañado en la placa madre por uno nuevo de calidad original, e instalación obligatoria de un nuevo diodo flyback 1N4007 para amoldar picos inductivos destructivos."
    },
    {
      id: "led-daño",
      title: "Tiras de Luces LED Apagadas por Completo o Parpadeando Locamente",
      symptom: "Secciones enteras de la mesa o iluminación LED de fútbol están muertas, o parpadean alternando colores extraños sin lógica.",
      cause: "Falta de unificación de la masa (tierra GND) entre fuentes auxiliares, o ruptura estática del pin de datos dinámico del primer LED direccionable de la serie (WS2812B).",
      difficulty: "Media",
      estimatedTime: "25 min",
      steps: [
        "Use el tester para comprobar si ingresan +5V o +12V (dependiendo del tipo de tira) en el inicio del riel.",
        "Inspeccione el punto de unión física del cable de señal de datos (DIN). Es común que la vibración constante del solenoide lo quiebre.",
        "Si solo enciende el primer LED de la tira y los secuenciales quedan apagados, el canal de cascada del primer módulo controlador LED se ha quemado.",
        "Pruebe conectando la línea de datos del microcontrolador al pin del segundo LED de la tira bypassando el primero."
      ],
      solution: "Suelde un cable nuevo bypassando el LED quemado o corte el primer segmento dañado. Asegure un cable grueso de GND interconectando el chasis metálico de la fuente colmena con el pin GND de la placa base."
    },
    {
      id: "no-monedas",
      title: "El Monedero GD-100 / CH-926 Rechaza Monedas o No Otorga Créditos",
      symptom: "Las piezas introducidas caen directo a la tolva de devolución, el visor del monedero está apagado o las monedas pasan libremente pero no suman saldo de créditos.",
      cause: "Moneda patronal de referencia floja, caída o equivocada montada en la prensa de comparación del validador, potenciómetro de ganancia descalibrado, suciedad en ópticos infrarrojos internos.",
      difficulty: "Fácil",
      estimatedTime: "15 min",
      steps: [
        "Verifique que la moneda de muestra patrón introducida en el lateral del validador electrónico CH-926 sea fresca y no esté gastada o doblada.",
        "Limpie suavemente la rampa deslizante de monedas interna deslizando una tarjeta con alcohol isopropílico para retirar aceites o mugre de dedos.",
        "Compruebe si el selector trasero de velocidad de pulsos (Fast / Medium / Slow) está en la opción de 50ms (Medium), que es el estándar de lectura Shengkun.",
        "Mida el cable de señal 'COIN' (Color blanco/azul). Un pulso de masa momentáneo (Low active) debe generarse al atravesar la moneda."
      ],
      solution: "Ajuste fino del potenciómetro selector de compresión de inductancia ('Sensibilidad de Tolerancia') girando hacia la izquierda para mayor holgura. Limpieza óptica con cepillo suave de cerdas finas."
    },
    {
      id: "congelado",
      title: "El Sistema Enciende, Pero Está Completamente Congelado y No Responde",
      symptom: "Muestra caracteres fijos estáticos ('----' o '8888') en pantalla, no emite melodía de bienvenida audible, botones de juego inoperantes.",
      cause: "Falta de oscilación del cristal de cuarzo de 11.592 MHz que brinda los ciclos a la CPU, o capacitor electrolítico del circuito oscilador de RESET principal seco o degradado.",
      difficulty: "Compleja",
      estimatedTime: "45 min",
      steps: [
        "Conecte el osciloscopio o un tester sensible para monitorear tensión de RESET en el micro STC89C52 (Pin 9). Debe pasar a nivel bajo tras un pulso alto inicial al encender.",
        "Mida si el procesador central se sobrecalienta desproporcionadamente al tacto humano directo.",
        "Compruebe con cautín caliente si repasando de estaño fresco las patillas del cristal de plata se recupera la respuesta de oscilación.",
        "Desmonte con cuidado el chip MCU de su zócalo usando extractor de integrados e inspeccione contactos oxidados verdes."
      ],
      solution: "Limpieza química con aerosol limpiacontactos del zócalo de la CPU, reemplazo preventivo de los dos capacitores cerámicos de 30pF que guían el cristal de cuarzo comercial."
    },
    {
      id: "pcb-daño",
      title: "Cortocircuitos Fatales por Humedad o Derrame de Líquido en Tarjeta",
      symptom: "Olor a baquelita quemada, pistas quemadas y levantadas del circuito impreso, capacitores de filtrado soplados o explotados.",
      cause: "Ingreso accidental de refrescos/bebidas por las rendijas superiores de juego por parte de clientes de la sala.",
      difficulty: "Compleja",
      estimatedTime: "50 min",
      steps: [
        "Des energice de inmediato la máquina de juego. No intente encenderla bajo ningún concepto.",
        "Extraiga con cuidado el módulo PCB desatornillándolo y desconectando la faja de cables molex.",
        "Usa abundante limpiacontactos dieléctrico o alcohol isopropílico frotando firmemente con un cepillo de dientes de cerdas plásticas duras.",
        "Busque pistas de cobre rotas de color negro. Sane las pistas pelándolas con bisturí y soldando un hilo de cobre telefónico puente conductor.",
        "Inspeccione visualmente los capacitores radiales electrolíticos de 1000uF del bus regulador. Cámbielos si están hinchados."
      ],
      solution: "Remoción minuciosa de la corrosión galvánica líquida. Soldadura de puentes aislados de hilo esmaltado y reemplazo de capacitores soplados de la línea baja."
    },
    {
      id: "falla-puntos",
      title: "El Puntaje e Ingreso de Bola No Suma Correctamente Durante el Juego",
      symptom: "La bola de metal cae en un hoyo de fútbol específico pero el marcador central de créditos/tickets no reacciona, se salta el ciclo de pago o ignora el gol.",
      cause: "Módulo óptico infrarrojo (Rx/Tx) de hoyos descentrado mecánicamente por el impacto pesado continuo de la bola, suciedad de grasa obstruyendo el lente óptico infrarrojo, fotosensor dañado por fatiga térmica.",
      difficulty: "Media",
      estimatedTime: "30 min",
      steps: [
        "Ingrese al modo de prueba o autoexamen técnico con los switches de servicio internos.",
        "Pase manualmente una tarjeta opaca de cartón para tapar la señal en la ranura (Herradura óptica) del hoyo sospechoso.",
        "Mida el voltaje de salida del receptor del sensor infrarrojo afectado: la tensión debe alternar limpiamente de 0V a +5V DC al tapar el sensor.",
        "Verifique la correcta alineación vertical del emisor infrarrojo respecto al fototransistor receptor opuesto.",
        "Inspeccione la resistencia limitadora de corriente soldada a la serie del LED transmisor IR."
      ],
      solution: "Limpieza profunda de la lente usando hisopo con alcohol isopropílico. Si el sensor está dañado, reemplace el optoacoplador de herradura IR slot usando repuestos genéricos o fotodiodos estándar de 5mm."
    }
  ];

  // Mantenimiento Preventivo Planificado
  const maintenanceRoutines = [
    {
      period: "Mensual",
      task: "Auditoría Física de Sensores e Iluminación",
      actions: [
        "Aspirar el polvo y aserrín acumulado en el fondo del gabinete de madera de pinball.",
        "Limpieza de la herradura óptica de los 15 hoyos de fútbol usando hisopos secos.",
        "Prueba acústica: validar respuesta limpia de altavoces de 8 ohmios.",
        "Inspección de tensión de salida de la fuente: Debe ser de +5.05V estables ±0.05V."
      ]
    },
    {
      period: "Anual",
      task: "Calibración Mayor y Desgasificación Mecánica",
      actions: [
        "Ajuste manual del tensor del resorte cónico de lanzamiento de metal.",
        "Remoción del carrusel giratorio central y engrase técnico ligero de los rodamientos sellados con grasa blanca de litio (NUNCA grasa mineral negra pesada).",
        "Sustitución de diodos rectificadores 1N4007 de solenoide cansados térmicamente.",
        "Baño químico repelente de humedad dieléctrico en la PCB principal para prevenir óxido salino ambiental."
      ]
    }
  ];

  // Equivalencias de Repuestos AliExpress/Local
  const replacementParts = [
    {
      spanish: "Fuente Conmutada Digital Arcade",
      english: "Arcade Switching Power Supply WY-03C",
      specs: "+5V 4A, +12V 6A, +24V 3A (Ajustable)",
      purchaseWeb: "AliExpress / Distribuidores Arcade Internacionales",
      equivalent: "Fuente conmutada genérica industrial de tres salidas de riel DIN con el puenteado manual correspondiente de pines."
    },
    {
      spanish: "Microcontrolador MCS-51 de 8 Bits",
      english: "Microcontroller IC STC89C52RC / STC89C51",
      specs: "40 Pines empaquetado DIP, oscilador externo",
      purchaseWeb: "eBay, AliExpress, Tiendas Locales de Electrónica Especializadas",
      equivalent: "AT89S52 de Microchip / Atmel (Requiere quemar la BIOS exacta programada por el fabricante del pinball en grabador especializado)."
    },
    {
      spanish: "Bobina / Solenoide Solenoide Lanzador",
      english: "Ejector Solenoid Shaker Assembly 24V",
      specs: "24V-36V DC, resistencia de 16-20 Ohms",
      purchaseWeb: "Compañías de repuestos de pinball, AliExpress",
      equivalent: "Cualquier bobina electromecánica estándar de pinball Williams modelo de repuesto AE-23-800 sustituyendo el émbolo cilíndrico original."
    },
    {
      spanish: "Sensor Óptico de Herradura Ranurado",
      english: "U-Shaped Slot Optical Sensor Phototransistor",
      specs: "Ancho de ranura de 5mm, salida lógica activa",
      purchaseWeb: "AliExpress / Mouser Electronics",
      equivalent: "Módulo óptico comercial ITR9608 o TCST2103 que se conecta directamente sin modificar el arnés original."
    }
  ];

  // Herramientas necesarias
  const requiredTools = [
    { name: "Multímetro Digital de Rango Automático", purpose: "Medición exacta de voltajes lógicos de 5V, caídas de bobinas (24V) y chequeo de continuidad libre de tensión." },
    { name: "Cautín de Estación Regulable con Temperatura (40W - 60W)", purpose: "Retirar transistores TIP122 calentando bornes sin destruir pistas frágiles de baquelita de placa de pinball." },
    { name: "Aire Comprimido / Soplador Eléctrico Portátil", purpose: "Remover polvo abrasivo de monedas y metal de los sensores ópticos infrarrojos internos." },
    { name: "Desoldador de Vacío Tipo Pistón de Mano", purpose: "Limpiar agujeros metalizados de soldadura en la PCB para el intercambio de chips integrados dañados." },
    { name: "Alcohol Isopropílico con Nivel de Pureza >99.7%", purpose: "Limpiar resinas, óxidos y aceites en componentes electrónicos sin inducir cortocircuitos por humedad." },
    { name: "Pinzas Pelacables de Alta Precisión AWG 22-26", purpose: "Rehacer empalmes sueltos de los conectores de señal del arnés y validador multimoneda." }
  ];

  const selectedFault = technicalFaults.find(f => f.id === selectedFaultId) || technicalFaults[0];

  const toggleStepCompleted = (faultId: string, idx: number) => {
    setCompletedSteps(prev => {
      const faultSteps = prev[faultId] || {};
      return {
        ...prev,
        [faultId]: {
          ...faultSteps,
          [idx]: !faultSteps[idx]
        }
      };
    });
  };

  const getCompletedCount = (faultId: string, totalSteps: number) => {
    const faultSteps = completedSteps[faultId] || {};
    return Object.values(faultSteps).filter(Boolean).length;
  };

  return (
    <div className="bg-slate-900/40 border border-white/5 backdrop-blur-2xl rounded-3xl p-6 md:p-8 space-y-8 shadow-2xl relative overflow-hidden">
      
      {/* Decorative cybernetic overlay background visual */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none -mr-40 -mt-40" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none -ml-40 -mb-40" />

      {/* Header section with brand tags */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/5 pb-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md flex items-center gap-1">
              <Gauge size={12} /> Técnico Máster (20+ Años)
            </span>
            <span className="text-[10px] uppercase font-black tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-md flex items-center gap-1">
              <Activity size={12} /> Pinball Revolución
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Wrench className="text-blue-500" size={24} />
            Enciclopedia de Mantenimiento & Solución de Fallas
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-2xl font-light">
            Investigación en campo profunda, componentes internos exactos, guías paso a paso de reemplazo electrónico e ingeniería inversa adaptada a operadores y concesionarios locales de América Latina.
          </p>
        </div>

        {/* Floating animated retro visual widget */}
        <div className="p-4 bg-gradient-to-br from-indigo-950/40 to-slate-950 border border-indigo-500/10 rounded-2xl relative shrink-0 min-w-[200px]">
          <div className="flex items-center gap-2.5 text-indigo-300 font-bold text-xs mb-1">
            <Sparkles size={14} className="text-amber-300 animate-pulse" />
            Temática: Fútbol Ruleta
          </div>
          <p className="text-[10px] text-slate-400 leading-normal font-light">
            Modelos de 10 y 15 hoyos.<br />PCB de arquitectura STC de 40 pines.<br />Lanzador electromecánico.
          </p>
        </div>
      </div>

      {/* Navigation tabs with smooth indicators */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-slate-950/45 rounded-2xl border border-white/5">
        <button
          onClick={() => setActiveTab('info')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'info' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Info size={14} /> Ficha Técnica
        </button>
        <button
          onClick={() => setActiveTab('components')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'components' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Cpu size={14} /> Componentes Reales
        </button>
        <button
          onClick={() => setActiveTab('faults')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'faults' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <AlertTriangle size={14} /> Diagnóstico Interactivo
        </button>
        <button
          onClick={() => setActiveTab('maintenance')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'maintenance' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sliders size={14} /> Mantenimiento Preventivo
        </button>
        <button
          onClick={() => setActiveTab('parts')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'parts' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ShoppingBag size={14} /> Tienda Repuestos
        </button>
        <button
          onClick={() => setActiveTab('tools')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'tools' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Hammer size={14} /> Caja Herramientas
        </button>
      </div>

      {/* SEARCH BAR (For searching throughout entire research) */}
      <div className="relative">
        <input
          type="text"
          placeholder="🔍 Buscar fallas, componentes, voltajes, transistores o repuestos alternativos..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full p-3.5 pl-11 bg-slate-950/60 border border-white/5 rounded-2xl text-sm placeholder:text-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all focus:bg-slate-950"
        />
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white bg-white/5 p-1 px-2.5 rounded-lg border border-white/5 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Searched item results warning */}
      {searchTerm && (
        <div className="p-2 px-4 bg-blue-500/5 border border-blue-400/10 rounded-xl text-xs text-blue-300 italic">
          Buscando incidencias y términos de: &quot;{searchTerm}&quot;
        </div>
      )}

      {/* --- TAB CONTENT 1: FICHA TÉCNICA --- */}
      {activeTab === 'info' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="bg-slate-950/40 rounded-2xl p-6 border border-white/5 space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-white/5">
              <Info size={16} className="text-blue-400" /> Ficha Técnica Oficial (Pinball Revolución)
            </h3>
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-slate-500 block font-semibold mb-0.5">Nombre Comercial Exacto:</span>
                <span className="text-slate-200 font-medium">{technicalSpecs.brand}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-semibold mb-0.5">Ensambladores & Fabricación:</span>
                <span className="text-slate-200 font-medium block leading-normal">{technicalSpecs.assembly}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-semibold mb-0.5">Tipo de Microprocesador Central:</span>
                <span className="text-slate-200 font-mono text-emerald-400 font-semibold">{technicalSpecs.mcu}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-semibold mb-0.5">Distribución Geográfica Principal:</span>
                <span className="text-slate-200 font-medium flex items-center gap-1.5">
                  <MapPin size={12} className="text-rose-400 shrink-0" />
                  Honduras, Guatemala, El Salvador, México, Perú, Colombia, Nicaragua.
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-950/40 rounded-2xl p-6 border border-white/5 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-white/5">
                <Zap size={16} className="text-indigo-400" /> Esquema Eléctrico & Niveles de Tensión
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-light">
                Estas máquinas importadas de China utilizan un bus de alimentación tri-riel regulado mediante fuentes de conmutación arcade. Nunca altere u omita los fusibles de la línea de bobinas (solenoides) para evitar quemar los transistores Darlington TIP122 de la PCB amarilla.
              </p>
              
              <div className="grid grid-cols-3 gap-2.5 text-center mt-2">
                <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                  <p className="text-base font-bold text-emerald-400 font-mono">+5V DC</p>
                  <p className="text-[10px] text-slate-500 font-semibold mt-1 uppercase">Lógica Digital CPU</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                  <p className="text-base font-bold text-blue-400 font-mono">+12V DC</p>
                  <p className="text-[10px] text-slate-500 font-semibold mt-1 uppercase">LEDs & Validador</p>
                </div>
                <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
                  <p className="text-base font-bold text-purple-400 font-mono">+24V DC</p>
                  <p className="text-[10px] text-slate-500 font-semibold mt-1 uppercase">Bobinas Eyectores</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-yellow-500/5 rounded-2xl border border-yellow-500/15 text-[11px] text-yellow-300 flex items-start gap-3 mt-4">
              <ShieldAlert size={16} className="shrink-0 mt-0.5 text-yellow-400" />
              <div>
                <strong className="font-semibold block mb-0.5">Recomendación de Oro del Técnico:</strong>
                Gire el potenciómetro fino de la fuente para afinar la línea en +5.08V DC en la PCB principal. Un voltaje lógico de 4.8V causará parpadeos continuos en la lógica general de juego.
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* --- TAB CONTENT 2: COMPONENTES REALES --- */}
      {activeTab === 'components' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {componentCategories
            .filter(c => 
              c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
              c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
              c.details.some(d => d.toLowerCase().includes(searchTerm.toLowerCase()))
            )
            .map((comp, idx) => (
              <div key={idx} className="bg-slate-950/40 rounded-3xl p-6 border border-white/5 flex flex-col justify-between hover:border-white/10 transition-colors group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 border border-indigo-400/20 px-2 py-0.5 rounded-md">
                      Módulo {idx + 1}
                    </h4>
                    <span className="text-[10px] font-mono text-slate-500 font-semibold">{comp.voltage}</span>
                  </div>
                  <h3 className="font-bold text-white text-base group-hover:text-blue-300 transition-colors">{comp.title}</h3>
                  <p className="text-xs text-slate-300 font-light leading-relaxed">{comp.description}</p>
                  
                  <ul className="space-y-2 pt-2">
                    {comp.details.map((detail, dIdx) => (
                      <li key={dIdx} className="text-xs text-slate-400 flex items-start gap-2">
                        <Check size={12} className="text-indigo-400 shrink-0 mt-1" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
            {componentCategories.length === 0 && (
              <div className="text-center text-slate-500 text-xs py-10 col-span-2">No se encontraron componentes con esa descripción.</div>
            )}
        </motion.div>
      )}

      {/* --- TAB CONTENT 3: DIAGNÓSTICO INTERACTIVO --- */}
      {activeTab === 'faults' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Left panel: List of common faults */}
          <div className="lg:col-span-1 bg-slate-950/20 rounded-2xl p-4 border border-white/5 space-y-2.5 h-[500px] overflow-y-auto">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-white/5 pb-2 mb-4">
              9 Fallas Clásicas Detectadas
            </h3>
            {technicalFaults
              .filter(f => 
                f.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                f.symptom.toLowerCase().includes(searchTerm.toLowerCase()) || 
                f.cause.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map(fault => {
                const totalSteps = fault.steps.length;
                const completed = getCompletedCount(fault.id, totalSteps);
                const isSelected = selectedFaultId === fault.id;
                
                return (
                  <button
                    key={fault.id}
                    onClick={() => { setSelectedFaultId(fault.id); }}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all relative flex flex-col gap-1 cursor-pointer ${
                      isSelected 
                        ? 'bg-blue-600/15 border-blue-500/30 shadow-md' 
                        : 'bg-white/5 border-white/5 hover:bg-white-[0.08]'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-xl" />
                    )}
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs text-white line-clamp-1">{fault.title}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold shrink-0 ${
                        fault.difficulty === 'Fácil' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : fault.difficulty === 'Media'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {fault.difficulty}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-1 leading-normal font-light">{fault.symptom}</p>
                    
                    {/* Status gauge */}
                    <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-1.5">
                      <div 
                        className="bg-emerald-400 h-full transition-all duration-300" 
                        style={{ width: `${(completed / totalSteps) * 100}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[8px] text-slate-500 mt-0.5 font-bold uppercase tracking-wider">
                      <span>Pasos completados</span>
                      <span>{completed} / {totalSteps}</span>
                    </div>
                  </button>
                );
              })}
          </div>

          {/* Right panel: Deep fault steps and resolution instruction card */}
          <div className="lg:col-span-2 bg-slate-950/45 rounded-3xl p-6 md:p-8 border border-white/5 flex flex-col justify-between">
            {selectedFault ? (
              <div className="space-y-6">
                
                {/* Fault details header */}
                <div className="border-b border-white/5 pb-4 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] uppercase font-black text-blue-400 tracking-widest bg-blue-500/10 border border-blue-400/20 px-2 py-0.5 rounded">
                      Falla Seleccionada
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 font-semibold">Tiempo Estimado: <strong className="text-slate-300">{selectedFault.estimatedTime}</strong></span>
                  </div>
                  <h3 className="text-lg font-black text-white leading-snug">{selectedFault.title}</h3>
                </div>

                {/* Symptom & Cause boxes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-900 border border-white/5 rounded-2xl space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <AlertTriangle size={12} className="text-red-400" /> Síntoma Físico Común:
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed font-light">{selectedFault.symptom}</p>
                  </div>
                  <div className="p-4 bg-slate-900 border border-white/5 rounded-2xl space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Cpu size={12} className="text-indigo-400" /> Origen & Causa Probable:
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed font-light">{selectedFault.cause}</p>
                  </div>
                </div>

                {/* Checklist steps */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-teal-400 uppercase tracking-widest flex items-center gap-1.5">
                    <CheckCircle2 size={14} /> Procedimiento de Diagnóstico Técnico (Pasos en Orden)
                  </h4>
                  
                  <div className="space-y-2.5">
                    {selectedFault.steps.map((step, idx) => {
                      const isStepDone = !!(completedSteps[selectedFault.id]?.[idx]);
                      return (
                        <div 
                          key={idx}
                          onClick={() => toggleStepCompleted(selectedFault.id, idx)}
                          className={`p-3 rounded-xl border text-xs cursor-pointer flex items-start gap-3 transition-all ${
                            isStepDone 
                              ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-400 shadow-md' 
                              : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          <button className="shrink-0 mt-0.5">
                            {isStepDone ? (
                              <CheckCircle2 size={16} className="text-emerald-500" />
                            ) : (
                              <div className="w-4.5 h-4.5 rounded border border-slate-500 hover:border-slate-300 transition-colors"></div>
                            )}
                          </button>
                          <span className={isStepDone ? 'line-through opacity-80 font-light' : 'font-light'}>{step}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Technical solution card */}
                <div className="p-5 bg-gradient-to-r from-blue-950/50 to-slate-900 rounded-2xl border border-blue-500/15 space-y-1.5">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Wrench size={13} /> Reparación & Solución Definitiva de Campo:
                  </span>
                  <p className="text-xs text-slate-200 font-semibold leading-relaxed">{selectedFault.solution}</p>
                </div>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-slate-500 text-center space-y-4">
                <HelpCircle size={48} className="text-slate-600 animate-bounce" />
                <p className="text-sm">Seleccione una falla técnica en la lista izquierda para iniciar el diagnóstico detallado.</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* --- TAB CONTENT 4: MANTENIMIENTO PREVENTIVO --- */}
      {activeTab === 'maintenance' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {maintenanceRoutines.map((routine, idx) => (
            <div key={idx} className="bg-slate-950/40 rounded-3xl p-6 border border-white/5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Activity size={16} className="text-teal-400" /> Rutina {routine.period}
                </h3>
                <span className="text-[10px] uppercase font-bold text-teal-300 bg-teal-500/10 border border-teal-400/20 px-2.5 py-0.5 rounded-full">
                  Foco: {routine.task}
                </span>
              </div>
              
              <p className="text-xs text-slate-400 leading-normal font-light">
                Planificación estandarizada para garantizar que la máquina de slots rinda con un tiempo de actividad del 99.8% libre de reclamaciones por pérdida de créditos vacíos:
              </p>

              <div className="space-y-2.5 pt-1">
                {routine.actions.map((act, aIdx) => (
                  <div key={aIdx} className="p-3 bg-white/5 rounded-xl border border-white/5 text-xs text-slate-300 flex items-start gap-2.5 font-light">
                    <span className="w-5 h-5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      {aIdx + 1}
                    </span>
                    <span>{act}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* --- TAB CONTENT 5: BUSCADOR DE REPUESTOS --- */}
      {activeTab === 'parts' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <p className="text-xs text-slate-400 leading-relaxed font-light">
            Encontrar repuestos genuinos para las placas amarillas y solenoides chinos en AliExpress, con su equivalencia técnica local disponible en cualquier electrónica comercial nacional para resolver emergencias rápidamente:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {replacementParts
              .filter(p => 
                p.spanish.toLowerCase().includes(searchTerm.toLowerCase()) || 
                p.english.toLowerCase().includes(searchTerm.toLowerCase()) || 
                p.equivalent.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((part, idx) => (
                <div key={idx} className="bg-slate-950/40 rounded-3xl p-6 border border-white/5 flex flex-col justify-between hover:border-white/10 transition-colors">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <h3 className="font-extrabold text-white text-sm">{part.spanish}</h3>
                      <span className="text-[9px] font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/15 px-2 py-0.5 rounded font-black uppercase">COMPATIBLE</span>
                    </div>
                    
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-slate-500 block font-semibold mb-0.5">Término en Inglés para Buscar:</span>
                        <span className="text-slate-200 font-mono text-blue-300 font-medium">{part.english}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block font-semibold mb-0.5">Especificación Eléctrica / Mecánica:</span>
                        <span className="text-slate-300 font-light">{part.specs}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block font-semibold mb-0.5">Tiendas de Adquisición Recomendadas:</span>
                        <p className="text-emerald-400 font-bold flex items-center gap-1">
                          <ExternalLink size={12} /> {part.purchaseWeb}
                        </p>
                      </div>
                      <div className="p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10 mt-1">
                        <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider block mb-1">Equivalente de Emergencia Local:</span>
                        <p className="text-slate-300 text-xs leading-normal font-light">{part.equivalent}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </motion.div>
      )}

      {/* --- TAB CONTENT 6: CAJA DE HERRAMIENTAS --- */}
      {activeTab === 'tools' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {requiredTools
            .filter(t => 
              t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
              t.purpose.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((tool, idx) => (
              <div key={idx} className="bg-slate-950/40 rounded-2xl p-5 border border-white/5 space-y-2 flex flex-col justify-between hover:border-white/10 transition-colors">
                <div className="space-y-2">
                  <span className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                    {idx + 1}
                  </span>
                  <h3 className="font-bold text-white text-xs uppercase tracking-wider">{tool.name}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-light">{tool.purpose}</p>
                </div>
              </div>
            ))}
        </motion.div>
      )}

    </div>
  );
}
