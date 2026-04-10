import json

p = 'routines.json'
with open(p) as f:
    db = json.load(f)

# The copywriter's dictionary of instructions and mistakes
copy_data = {
    "swing": {
        "instructions": ["Colócate con los pies separados al ancho de los hombros, la kettlebell en el suelo.", "Inclínate desde las caderas y agarra el asa con ambas manos.", "Lanza la kettlebell hacia atrás entre tus piernas.", "Impulsa la cadera hacia adelante explosivamente para elevar la pesa a nivel del pecho.", "Deja que la pesa caiga guiada hacia atrás y repite."],
        "mistakes": ["Hacer una sentadilla en lugar de un bisagra de cadera.", "Usar los brazos para levantar la pesa en lugar del impulso de cadera.", "Hiperextender la espalda baja al llegar arriba."]
    },
    "goblet_squat": {
        "instructions": ["Sostén la kettlebell a la altura del pecho por los costados (los 'cuernos').", "Mantén el pecho erguido y los codos pegados al cuerpo.", "Desciende empujando las caderas hacia atrás y doblando las rodillas.", "Baja hasta que tus muslos estén paralelos al suelo o más abajo.", "Empuja con los talones para volver a la posición inicial."],
        "mistakes": ["Dejar que las rodillas colapsen hacia adentro.", "Redondear la espalda durante el descenso.", "Levantar los talones del suelo."]
    },
    "clean_and_press": {
        "instructions": ["Comienza con un swing a una mano.", "En lugar de extender el brazo, tira del codo hacia atrás para llevar la pesa a la posición de 'Rack' en el hombro.", "Asegúrate de que la pesa descanse suavemente sobre tu antebrazo y hombro.", "Aprieta el core y empuja la pesa sobre la cabeza hasta bloquear el codo.", "Baja la pesa a la posición de rack y luego devuélvela al swing."],
        "mistakes": ["Golpear el antebrazo con la pesa por no rotar la mano a tiempo.", "Usar las rodillas (empuje) en lugar de un estricto press de hombro.", "No mantener el antebrazo vertical antes del press."]
    },
    "russian_twist": {
        "instructions": ["Siéntate en el suelo con las rodillas dobladas y los pies elevados unos centímetros.", "Sostén la kettlebell por el asa o por la bola frente a ti.", "Inclínate ligeramente hacia atrás manteniendo la espalda recta (formando una V).", "Gira el torso hacia la derecha, llevando la pesa al lado de la cadera.", "Gira hacia el lado izquierdo y repite el movimiento."],
        "mistakes": ["Redondear excesivamente la espalda baja.", "Girar solo los brazos sin acompañar con el torso.", "Bajar los pies al suelo perdiendo tensión del core."]
    },
    "snatch": {
        "instructions": ["Comienza con un swing explosivo a una mano.", "En lugar de detenerte a la altura del hombro, continúa la trayectoria hacia arriba.", "Tira del codo hacia atrás ('high pull') y perfora la mano hacia arriba ('punch').", "Bloquea el brazo completamente por encima de la cabeza, asegurando una transición suave del peso sobre el dorso de la mano.", "Pivota el peso de vuelta al swing de forma controlada."],
        "mistakes": ["Permitir que la pesa golpee dolorosamente el antebrazo.", "Hacer un press en la parte final en lugar de usar el impulso.", "No dominar primero el swing y el clean perfectamente."]
    },
    "double_swing": {
        "instructions": ["Coloca dos kettlebells frente a ti con una postura ligeramente más ancha.", "Agarra ambas pesas y colócalas en un ángulo ligeramente ladeado.", "Realiza el movimiento de bisagra de cadera lanzando ambas hacia atrás con fuerza.", "Aprieta los glúteos explosivamente balanceando ambas pesas a nivel del pecho.", "Regresa de forma coordinada controlando el peso combinado."],
        "mistakes": ["Separar o desalinear las pesas en el aire.", "Usar los hombros para elevarlas debido al exceso de peso.", "Abrir excesivamente las piernas perdiendo estabilidad."]
    },
    "double_clean": {
        "instructions": ["Comienza con un swing de dos kettlebells.", "Mantén los brazos cerca de tus costados, pegando los codos.", "Jala el peso llevando ambas pesas hacia la posición de 'Rack' en los hombros de forma simultánea.", "Inserta tus manos rápidamente para que las pesas giren y recaigan sobre tus antebrazos suavemente.", "Contrae el abdomen para asimilar el impacto de llegada."],
        "mistakes": ["Dejar espacio entre los codos y las costillas en el rack.", "Rotación incorrecta causando fuerte impacto en las muñecas.", "Hiperextender la espalda para compensar el peso de dos pesas."]
    },
    "double_front_squat": {
        "instructions": ["Inicia desde una posición de 'Rack' dual (dos pesas apoyadas en el pecho/hombros).", "Mantén el pecho en alto para soportar la carga frontal.", "Desciende empujando hacia atrás las caderas y abriendo las rodillas.", "Baja con control intentando mantener el torso lo más vertical posible.", "Conduce hasta arriba empujando firme a través del suelo entero."],
        "mistakes": ["Permitir que los codos colapsen hacia tus piernas.", "Redondear los hombros hacia adelante por la carga.", "No respirar en el inicio del descenso (pérdida de presión intra-abdominal)."]
    },
    "turkish_get_up": {
        "instructions": ["Acuéstate de espaldas. Empuja una kettlebell hacia arriba con tu brazo derecho y dobla la rodilla derecha.", "Impúlsate apoyándote en el codo izquierdo, sin dejar de mirar la pesa.", "Pasa al apoyo sobre tu mano izquierda (brazo recto).", "Eleva las caderas del suelo formando un puente.", "Desliza tu pierna izquierda por debajo hasta apoyar la pantorrilla, levanta la mano del suelo y ponte de pie con la pesa sobre ti."],
        "mistakes": ["Doblar el brazo que sostiene la pesa.", "Dejar de mirar la kettlebell y perder el equilibrio.", "Hacer los movimientos rápido, perdiendo la segmentación."]
    },
    "halo": {
        "instructions": ["Sujeta la kettlebell al revés (de la bola) frente a tu pecho, agarrando los 'cuernos'.", "Mueve la pesa describiendo un círculo estrecho alrededor de tu cabeza.", "Pasa la pesa justo detrás del cuello manteniéndola cerca.", "Vuelve a la posición del pecho y repite la rotación en sentido contrario.", "Mantén el core sumamente tenso para evitar oscilación de la columna."],
        "mistakes": ["Mover el cuello o torso hacia la pesa en lugar de rotar los brazos.", "Golpearse la cabeza por perder control en el arco trasero.", "Hacer un círculo muy abierto y perder tensión de movilidad."]
    },
    "plank": {
        "instructions": ["Ponte en posición de plancha sobre tus antebrazos o manos en el suelo.", "Coloca tus manos al nivel de los hombros y alarga el cuello.", "Contrae los glúteos, los muslos y el core al máximo al estilo 'Hardstyle'.", "Tu cuerpo debe estar en línea recta desde los talones hasta la cabeza.", "Respira rítmicamente sin perder la tensión de cuerpo completo."],
        "mistakes": ["Dejar caer o arquear la zona lumbar.", "Levantar demasiado las caderas hacia el techo.", "Olvidarse de respirar manteniendo la contracción."]
    },
    "high_pull": {
        "instructions": ["Realiza un inicio idéntico al swing a una mano.", "Cuando la pesa alcance el punto ciego frente a la cadera, flexiona y tira del codo horizontalmente hacia afuera y hacia atrás.", "La trayectoria de la pesa debe elevarse recta y paralela a tu cabeza de forma ligera.", "Controla el descenso guiando la kettlebell de vuelta a la curva del swing de forma fluida.", "Concentra el poder desde las caderas, usando el brazo sólo como guía final."],
        "mistakes": ["Tirar demasiado pronto perdiendo la potencia inicial de la cadera.", "Enrollar o doblar demasiado la muñeca al elevar.", "Soltar el agarre y perder control en la altura máxima."]
    },
    "push_press": {
        "instructions": ["Con la kettlebell en posición rack a un brazo, separa los pies a la altura de los hombros.", "Realiza una leve y rápida flexión de rodillas (el 'dip').", "Extiende explosivamente las rodillas y caderas transfirendo el impulso hacia arriba.", "Usa esa inercia para hacer un 'press' empujando la kettlebell hasta bloquear el codo arriba de tu cabeza.", "Baja el peso controladamente a la posición rack."],
        "mistakes": ["Bajar demasiado en la flexión simulando una sentadilla completa.", "Empujar con el brazo antes de finalizar la extensión explosiva de piernas.", "Arquear excesivamente la lumbar en vez de empujar en línea recta."]
    },
    "jerk": {
        "instructions": ["Desde la posición de rack, efectúa el primer 'dip' para generar potencia hacia arriba e impulsa la pesa.", "Mientras la pesa sube libre, realiza una SEGUNDA flexión rápida de rodillas (segundo 'dip' o descenso) para 'meterte' debajo de ella.", "Bloquea tu brazo firme y estirado mientras tus rodillas aún están dobladas.", "Finaliza extendiendo las rodillas y logrando ponerte totalmente erguido con el peso arriba.", "Retorna la kettlebell a rack amortiguando con otra sutil flexión."],
        "mistakes": ["No flexionar las rodillas bajo el peso, volviéndolo un simple press.", "Incoordinación entre brazos y el 'catch' de piernas.", "Llevar la pesa por delante en vez del centro de gravedad."]
    },
    "sumo_deadlift": {
        "instructions": ["Adopta una postura muy ancha con los pies apuntando ligeramente hacia afuera.", "La kettlebell descansa justo debajo de ti, en el centro.", "Empuja las caderas hacia atrás, el pecho arriba, y toma el asa con ambas manos.", "Empuja el suelo con los pies, usando los isquios y glúteos, para pararte verticalmente.", "Baja el peso controlando el movimiento por el mismo recorrido sin doblar la espina."],
        "mistakes": ["Usar la espalda baja en lugar de las piernas.", "Subir los hombros en exceso al estar arriba.", "Dejar caer el pecho hacia abajo en la fase inicial."]
    },
    "suitcase_deadlift": {
        "instructions": ["Coloca una kettlebell a un lado de tu pie derecho.", "Manten una postura recta y separa los pies al ancho de cadera.", "Realiza una bisagra asimétrica, bajando a agarrar el asa unicamente con la mano derecha.", "Párate rectamente oponiendo resistencia lateral para no doblar el torso (anti-flexión lateral).", "Desciende lento hasta tocar el suelo. Repite primero de este lado, luego cambia."],
        "mistakes": ["Torcer los hombros o laderas ladeando el tronco hacia el peso.", "Convertir el movimiento en sentadilla pura.", "No utilizar tensión total en el brazo inactivo que cuelga vacío."]
    },
    "rdl": {
        "instructions": ["Empeza de pie sujetando una/dos kettlebell frente a los muslos, con rodillas apenas semi-flexionadas.", "Mientras mantienes la columna alineada, empuja la cadera hacia atrás lentamente.", "Sigue bajando el torso hasta sentir un gran estiramiento en la zona trasera de las piernas (isquiotibiales).", "Exhalando, empuja los glúteos hacia adelante regresando arriba enérgicamente.", "Manten las pesas cerca de las pantorrillas durante el trayecto."],
        "mistakes": ["Doblillar las rodillas anulando la tensión de cadera.", "Rodear o encorvar los hombros al llegar al extremo de la bisagra.", "Bajar demasiado forzando la curvatura pélvica."]
    },
    "goblet_lunge": {
        "instructions": ["Sujeta tu kettlebell estilo copa pegada frente a tu esternón.", "Da un paso controlado hacia atrás con una de tus piernas.", "Desciende las caderas reduciendo ambas rodillas a ángulos aproximados de 90°.", "Tu rodilla trasera debe merodear cerca del piso sin impactarlo.", "Impúlsate firme con el talón frontal hacia adelante para retomar el equilibrio de a dos pies."],
        "mistakes": ["Inclinar el pecho sobre la rodilla perdiendo postura recta.", "Golpear la rodilla trasera fuertemente en el cemento.", "No apretar correctamente el peso, lo que afecta el centro de balance."]
    },
    "rack_lunge": {
        "instructions": ["Inicia con la kettlebell amarrada en posición rack sobre uno de tus brazos/hombros.", "La asimetría del peso pondrá a prueba vitalmente tu pared abdominal lateral.", "Con paso firme hacia retroceso (o avance o estático), desciende conteniendo postura erguida.", "Eleva la masa empujando vigorosamente, vigilando que el codo armado siga estricto.", "Realiza de un lado completo y traspasa después el artefacto a la zona opuesta."],
        "mistakes": ["Ceder ante el peso de un lado contorsionando la cadera.", "Dejar fugar el codo separándolo de nuestras costillas.", "Acortar las zancadas comprometiendo los rangos de articulación."]
    },
    "overhead_squat": {
        "instructions": ["Eleva una kettlebell en estricto press hasta tener el brazo completamente estirado al cielo.", "Manteniendo la fijación visual sutil, abre las piernas poco más que hombros.", "Alinea de manera impecable y desliza cadera abajo y atrás en la mayor profundidad posible de sentadilla.", "Trata de guardar ese brazo como pilar sólido en la vertical todo tu trayecto.", "Presiona tus pies desde la base inferior para estabilizarte erguido de regreso."],
        "mistakes": ["Falta notoria de movilidad de tobillos o hombro, derivando flexiones de codo.", "Dejar que el peso desvíe la escápula de forma asimétrica.", "Querer ejecutarlo con altos tonelajes antes de dominar ligereza."]
    },
    "bottom_up_press": {
        "instructions": ["Coge el cuerpo o el asa haciendo que la gran masa esférica de la kettlebell mire apuntando directo hacia arriba (bottom-up).", "Este estado en extremo inestable demandará grip aplastante y hombros inmaculados.", "Comprimiendo núcleo y exhalando empuja la pesa a verticalidad absoluta hasta extesión tope.", "Incluso más importante, tracciona el elemento al bajar para no desatar vibraciones críticas que derrumben la bola."],
        "mistakes": ["Prescindir observar atentamente el fierro para correcciones precisas.", "Soltar prematuramente tensión radial del antebrazo ocasionando colapso e impacto frontal."]
    },
    "half_get_up": {
        "instructions": ["Versión corta del levantamiento turco, para aislamiento focal de cinturilla escapular y tronco.", "Concluida la fase acostada hasta postrar la mano libre tras elevar cadera sobre el suelo.", "No llegas a reacomodar la pierna baja sino retrocedes controlando excéntricamente todo trayecto abdominal.", "La pesa, eterna rectora visual mantendrá el nivel en codo trancado."],
        "mistakes": ["Perseguir volumen antes de perfección concéntrica en postura oblicua base.", "Apresurar las posturas cortas ignorando latigazo pélvico."]
    },
    "windmill": {
        "instructions": ["Manteniendo la pesa alzada cenital o baja, alinea ambos pies angulados unos grados en igual dirección opuesta.", "El peso es empujado por sobre el eje cadera posterior, permitiéndote bajar contorsionando oblicuamente.", "La vista permanece soldada sobre la esfera alta (si se emplea press alto).", "Acaricia tu pantorrilla con el brazo opuesto hasta agotar radio lateral.", "Reculando potencia con oblicuos y zona coxis para re-escupirte a la cúpula central."],
        "mistakes": ["Torcer lumbares por ignorancia de elongar caderas ladeadas de base.", "Desviación ocular a mitad de proceso."]
    },
    "bent_over_row": {
        "instructions": ["Pies espaciados parejos, rodilla suave flex y torso de gran plomada paralela hacia frente (inclinación mayor agresiva).", "Permite que la/las kettlebells queden pesando abajo inertes sostenidas por los brazos largos.", "Atrae firmemente comprimiendo el codo dorsal intentando encajar el puño hasta cintura.", "No eleves tórax aprovechando inercia inútil.", "Libera los lastres aguantando milésimas cada tirón rudo trasero."],
        "mistakes": ["Desdoblar angulos simulando estar de pie reduciendo labor a dorsos.", "Exceder curvatura lumbar desprotegiéndonos de roturas del tejido."]
    },
    "renegade_row": {
        "instructions": ["Posición sublime plank-alta asentando ambas palmas de lleno apoyadas en el asa del acero.", "Estabiliza una amplísima apertura inferior (pies).", "Remonta con brutalidad unilateral un brazo y adosalo costillar logrando equilibrio dinámico tricípite-dorsal.", "Descansa alternado reduciendo la cadera torcida lo más cerca de cero total posible.", "Contracciones lentas son primordiales no rebotes espásticos."],
        "mistakes": ["Girar las crestas ilíacas descompensando balance anti-rotador.", "Usar asas plásticas que causen roturas dentales por fragilidad posicional de muñecas róladas."]
    },
    "figure_8": {
        "instructions": ["Semisentadilla atlética abierta, peso suspendido inercialmente basculando con mínima amplitud.", "Circunda suavemente la campana colándose entre tus codos posteriores pasando de mano al atraparla por bajo pierna.", "Continúa fluidamente describiendo ese 'símbolo infinito / 8' rotativo asimilando oscilamiento lúdico pero de precisión dantesca en agarre rácimo."],
        "mistakes": ["Impactos repetitivos accidentales zona femoral pélvica.", "Pérdidas de visibilización manual por sobreacelerar la curva."]
    },
    "farmers_carry": {
        "instructions": ["Levanta sendas piezas simétricas de hierro utilizando perfecto esquema sentadilla base por flancos.", "Adopta extrema arrogancia y pecho altivo en total plomada.", "Avanza cortante paso por tramos midiendo no el trecho abismal frontal sino resistir de brazos descolmatados tu aplomo gravitacional hasta quemar dedos."],
        "mistakes": ["Encorvar cráneo simulando agotamiento cervical prematuro.", "Andar de brincos asimétricos desbalanceando masa interna."]
    },
    "rack_walk": {
        "instructions": ["Rebasa tu volumen montando doble (o sencilla) kettlebell amparadas fuertemente sobre el cuño pectoral en Rack inamovible.", "Marcha manteniendo estática compresión respiratoria para soportar carga asfixiante.", "Logra asimilar perturbadoras asimetrías torácicas si fuese unilateral por trechos precisos.", "Evita hiper extensiones de columnas o 'descansos perjudiciales' usando caderas de base."],
        "mistakes": ["Apoyarse excesivo de espaldas para evadir sobrecargas esternoclaidomastoideas."]
    },
    "overhead_walk": {
        "instructions": ["Bloqueo de codo, nudillos empujando techo y latidos cardiacos tensos.", "Transporta paso a pasito masa sostenida combatiendo micro-inestabilidades dinámicas de la campana superior rotante.", "Mantén antebrazos alineados a la reja costal para transferir carga vía hombros hasta suela, sin fugar fuerza a tendinopatías codos."],
        "mistakes": ["Flexión o amortiguación de codo permitiendo derrumbar eje recto.", "Sobrecargar trapecios alzando asfixiante sobre orejas en vez de clavar escápulas descendidas."]
    }
}

for key, details in copy_data.items():
    if key in db['exercises']:
        db['exercises'][key]['instructions'] = details['instructions']
        db['exercises'][key]['mistakes'] = details['mistakes']
        
# Add a fallback for any exercises that might be missed
for key, ex in db['exercises'].items():
    if 'instructions' not in ex:
         ex['instructions'] = ["Mantén postura correcta.", "Ejecuta el movimiento con control."]
         ex['mistakes'] = ["Perder la tensión.", "Mala postura."]

with open(p, 'w') as f:
     json.dump(db, f, indent=2)

print("DB COPY UPDATED")
