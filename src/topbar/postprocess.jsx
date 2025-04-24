import React from 'react';
import { observer } from 'mobx-react-lite';
import {
  Dialog,
  Classes,
  Button,
  InputGroup,
  Tag,
  Callout,
  Spinner,
} from '@blueprintjs/core';
import { getKey } from 'polotno/utils/validate-key';
import { downloadFile } from 'polotno/utils/download';
import { useCredits } from '../credits';
import { ArrowRight } from '@blueprintjs/icons';

export const PostProcessModal = observer(
  ({ isOpen, onClose, imageUrl, imageType, imageName }) => {
    const promptRef = React.useRef(null);
    const [resultImage, setResultImage] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [prompt, setPrompt] = React.useState('');
    const [progress, setProgress] = React.useState(0);
    const { credits, consumeCredits, addCredits } = useCredits(
      'postProcessingCredits',
      5
    );
    const [showPayment, setShowPayment] = React.useState(false);
    const [paymentLoading, setPaymentLoading] = React.useState(false);
    const [stripeLoaded, setStripeLoaded] = React.useState(false);
    const stripeContainerRef = React.useRef(null);
    const [checkoutComplete, setCheckoutComplete] = React.useState(false);

    // Example prompts to offer quick options to users
    const presetPrompts = [
      {
        label: '✨ 3D Look',
        prompt:
          'Make it look like a professional 3D render, add depth, realistic materials and soft shadows',
      },
      {
        label: '🎨 Oil Painting',
        prompt:
          'Convert to oil painting style, detailed brush strokes, artistic texture',
      },
      {
        label: '🪶 Soft Paper Look',
        prompt:
          'Transform into soft paper texture, gentle shadows, matte finish',
      },
      {
        label: '📝 Sketch',
        prompt: 'Convert to pencil sketch, detailed linework, monochrome',
      },
      {
        label: '🖼️ Vintage Poster',
        prompt:
          'Make it look like a vintage poster, retro colors, slight texture',
      },
      {
        label: '🧼 Clean & Sharp',
        prompt:
          'Make the image clean, crisp and sharp with enhanced contrast and clarity',
      },
      {
        label: '🌆 Cyberpunk',
        prompt: 'Convert to cyberpunk style, neon colors, futuristic elements',
      },
      {
        label: '📜 Collage',
        prompt: 'Transform into paper cutout collage style, textured, artistic',
      },
    ];

    const handleExampleClick = (prompt) => {
      setPrompt(prompt);
    };

    const handleProcess = async () => {
      if (credits <= 0) {
        setShowPayment(true);
        return;
      }

      setLoading(true);
      setResultImage(null);
      setProgress(0);

      // Start fake progress
      const time = 30000;
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 1;
        });
      }, time / 100); // Update every 500ms to reach 95% in ~50 seconds

      try {
        // Send request to the API - using replicate as provider
        const response = await fetch(
          'https://api.polotno.com/api/ai/image-to-image?KEY=' + getKey(),
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              url: imageUrl,
              prompt: prompt,
              provider: 'openai',
            }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API request failed: ${errorText}`);
        }

        const data = await response.json();

        // Consume one credit
        consumeCredits(1);

        // Set the result image
        setResultImage(data.url);
        setProgress(100); // Set to 100% when complete
      } catch (error) {
        console.error('Error processing image:', error);
        alert('Error processing image: ' + error.message);
      } finally {
        setLoading(false);
        clearInterval(progressInterval);
      }
    };

    const handleTryAgain = () => {
      // Reset the result image and let user try again
      setResultImage(null);
    };

    const handleDownload = () => {
      if (!resultImage) return;

      // Extract filename from prompt or use the original imageName
      const fileName = prompt
        ? prompt
            .substring(0, 20)
            .replace(/[^a-z0-9]/gi, '-')
            .toLowerCase()
        : imageName;

      downloadFile(resultImage, `${fileName}.${imageType}`);
      onClose();
    };

    // Load Stripe.js and initialize checkout
    React.useEffect(() => {
      if (showPayment && !stripeLoaded) {
        setPaymentLoading(true);

        // Function to load the Stripe script
        const loadStripe = async () => {
          try {
            // Load the Stripe.js script
            const script = document.createElement('script');
            script.src = 'https://js.stripe.com/v3/';
            script.async = true;

            script.onload = async () => {
              try {
                // Get client secret from your backend
                const response = await fetch(
                  'http://localhost:3002/api/create-payment-intent',
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      amount: 1000, // $10.00
                      currency: 'usd',
                      userId: getKey(),
                    }),
                  }
                );

                if (!response.ok) {
                  throw new Error('Failed to create payment intent');
                }

                const { clientSecret } = await response.json();

                // Initialize Stripe
                const stripe = window.Stripe('pk_test_your_stripe_public_key');

                // Create and mount Checkout
                const elements = stripe.elements();
                const paymentElement = elements.create('payment');

                if (stripeContainerRef.current) {
                  paymentElement.mount(stripeContainerRef.current);

                  // Handle form submission
                  const form = document.getElementById('payment-form');
                  if (form) {
                    form.addEventListener('submit', async (event) => {
                      event.preventDefault();
                      setPaymentLoading(true);

                      try {
                        const { error } = await stripe.confirmPayment({
                          elements,
                          confirmParams: {
                            return_url: window.location.href,
                          },
                          redirect: 'if_required',
                        });

                        if (error) {
                          throw new Error(error.message);
                        }

                        // Payment succeeded
                        setCheckoutComplete(true);
                        addCredits(100);
                        setTimeout(() => {
                          setShowPayment(false);
                          setCheckoutComplete(false);
                        }, 2000);
                      } catch (err) {
                        console.error('Payment error:', err);
                        alert('Payment failed: ' + err.message);
                      } finally {
                        setPaymentLoading(false);
                      }
                    });
                  }
                }

                setStripeLoaded(true);
                setPaymentLoading(false);
              } catch (error) {
                console.error('Stripe initialization error:', error);
                setPaymentLoading(false);
              }
            };

            document.body.appendChild(script);
          } catch (error) {
            console.error('Failed to load Stripe:', error);
            setPaymentLoading(false);
          }
        };

        loadStripe();
      }
    }, [showPayment, stripeLoaded]);

    // For demo purposes only - in a real app, this would be validated server-side
    const handleDemoAddCredits = () => {
      addCredits(100);
      setShowPayment(false);
    };

    return (
      <>
        <Dialog
          isOpen={isOpen && !showPayment}
          onClose={onClose}
          title="Give Your Design a Final Polish"
          style={{ width: '800px', maxWidth: '95vw' }}
        >
          <div className={Classes.DIALOG_BODY}>
            {/* Subtitle */}
            <div
              style={{
                marginBottom: '20px',
                textAlign: 'center',
                color: '#5c7080',
              }}
            >
              Let AI add texture, shadows, depth, or style to your design.
            </div>

            {/* Images Container */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px',
              }}
            >
              {/* Original Image */}
              <div style={{ width: '45%', textAlign: 'center' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '10px',
                    fontWeight: 'bold',
                  }}
                >
                  Original
                </label>
                <img
                  src={imageUrl}
                  alt="Original image"
                  style={{
                    width: '100%',
                    maxHeight: '250px',
                    objectFit: 'contain',
                    border: '1px solid rgb(114 114 114 / 48%)',
                    borderRadius: '4px',
                  }}
                />
              </div>

              {/* Arrow */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 10px',
                }}
              >
                <ArrowRight size={30} color="#106ba3" />
              </div>

              {/* Result Image */}
              <div style={{ width: '45%', textAlign: 'center' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '10px',
                    fontWeight: 'bold',
                  }}
                >
                  {resultImage ? 'Result' : 'Preview'}
                </label>
                {resultImage ? (
                  <img
                    src={resultImage}
                    alt="Processed result"
                    style={{
                      width: '100%',
                      maxHeight: '250px',
                      objectFit: 'contain',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '250px',
                      position: 'relative',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Blurred background image */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: `url(${imageUrl})`,
                        backgroundSize: 'contain',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                        filter: 'blur(3px) brightness(0.8)',
                      }}
                    />
                    {/* Overlay with clear text and spinner */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        borderRadius: '4px',
                        zIndex: 1,
                      }}
                    >
                      {loading ? (
                        <>
                          <Spinner size={30} />
                          <div
                            style={{
                              marginTop: '10px',
                              fontWeight: 'bold',
                              color: '#106ba3',
                            }}
                          >
                            Processing... {progress}%
                          </div>
                        </>
                      ) : (
                        <div style={{ fontWeight: 'bold', color: '#106ba3' }}>
                          Preview will appear here
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Prompt Input */}
            <div style={{ marginBottom: '15px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '5px',
                  fontWeight: 'bold',
                }}
              >
                Describe the changes you want
              </label>

              {/* Preset prompt buttons */}
              {!resultImage && (
                <div
                  style={{
                    marginBottom: '10px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}
                >
                  <div
                    style={{
                      marginRight: '8px',
                      fontWeight: 'bold',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    PRESETS:
                  </div>
                  {presetPrompts.map((preset, index) => (
                    <Tag
                      key={index}
                      interactive
                      onClick={() => handleExampleClick(preset.prompt)}
                      style={{
                        cursor: 'pointer',
                        backgroundColor: '#f5f8fa',
                        color: '#106ba3',
                      }}
                    >
                      {preset.label}
                    </Tag>
                  ))}
                </div>
              )}

              <InputGroup
                placeholder="E.g., Make it look like oil painting"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !resultImage) {
                    handleProcess();
                  }
                }}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                fill
                disabled={!!resultImage}
              />
            </div>

            {/* Processing time message */}
            <div
              style={{
                textAlign: 'center',
                marginBottom: '15px',
                color: '#5c7080',
                fontSize: '12px',
              }}
            >
              Processing may take up to 30 seconds depending on the complexity
              of your request.
            </div>

            {/* Credits info */}
            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
              {credits > 0 ? (
                <span>{credits} credits left</span>
              ) : (
                <></>
                // <div>
                //   <Callout
                //     intent="warning"
                //     title="You're out of credits"
                //     style={{ marginBottom: '10px' }}
                //   >
                //     Purchase more credits to continue using the AI image
                //     processing.
                //   </Callout>
                //   <Button
                //     intent="success"
                //     onClick={() => setShowPayment(true)}
                //     style={{ marginTop: '5px' }}
                //   >
                //     Buy Credits
                //   </Button>
                // </div>
              )}
              {credits < 2 && (
                <div style={{ marginTop: '10px' }}>
                  <Callout intent="primary" style={{ marginBottom: '10px' }}>
                    Come back tomorrow for more free credits!
                  </Callout>
                  {/* Temporarily hidden
                  <Button
                    small
                    intent="success"
                    onClick={() => setShowPayment(true)}
                  >
                    Buy More Credits
                  </Button>
                  */}
                </div>
              )}
            </div>
          </div>

          <div className={Classes.DIALOG_FOOTER}>
            <div className={Classes.DIALOG_FOOTER_ACTIONS}>
              <Button onClick={onClose}>Cancel</Button>

              {!resultImage ? (
                <Button
                  onClick={handleProcess}
                  intent="primary"
                  loading={loading}
                  disabled={credits <= 0 || !prompt.trim()}
                  icon="flash"
                  className="plausible-event-name=postprocess-request"
                >
                  {prompt.trim()
                    ? 'Enhance Now'
                    : 'Add prompt or choose preset'}
                </Button>
              ) : (
                <>
                  <Button onClick={handleTryAgain}>Try Again</Button>
                  <Button
                    onClick={handleDownload}
                    intent="primary"
                    className="plausible-event-name=postprocess-download"
                  >
                    Download
                  </Button>
                </>
              )}
            </div>
          </div>
        </Dialog>

        {/* Payment Dialog */}
        <Dialog
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          title="Purchase Credits"
          style={{ width: '500px' }}
        >
          <div className={Classes.DIALOG_BODY}>
            <Callout
              intent="primary"
              title="100 Credits for $10"
              style={{ marginBottom: '20px' }}
            >
              <p>
                Credits are used for AI image processing. Each image
                transformation costs 1 credit.
              </p>
              <p>
                You'll get 100 credits for just $10, which means each
                transformation costs only $0.10!
              </p>
            </Callout>

            {checkoutComplete ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Callout intent="success" title="Payment Successful">
                  Your account has been credited with 100 credits. The dialog
                  will close shortly.
                </Callout>
              </div>
            ) : (
              <>
                {/* Stripe Elements will be mounted here */}
                <form id="payment-form" style={{ marginBottom: '20px' }}>
                  <div style={{ marginBottom: '15px' }}>
                    {paymentLoading && !stripeLoaded ? (
                      <div style={{ textAlign: 'center', padding: '20px' }}>
                        <Spinner size={30} />
                        <p>Loading payment form...</p>
                      </div>
                    ) : (
                      <div id="payment-element" ref={stripeContainerRef}></div>
                    )}
                  </div>
                  <Button
                    type="submit"
                    intent="success"
                    fill
                    loading={paymentLoading}
                    disabled={!stripeLoaded || paymentLoading}
                  >
                    Pay $10
                  </Button>
                </form>

                {/* For demo purposes only */}
                <div
                  style={{
                    marginTop: '20px',
                    padding: '10px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px',
                    fontSize: '12px',
                    textAlign: 'center',
                    color: '#5c7080',
                  }}
                >
                  <p>This is a demo implementation.</p>
                  <Button intent="success" onClick={handleDemoAddCredits}>
                    Add 100 Credits (Demo)
                  </Button>
                </div>
              </>
            )}
          </div>

          {!checkoutComplete && (
            <div className={Classes.DIALOG_FOOTER}>
              <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                <Button onClick={() => setShowPayment(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </Dialog>
      </>
    );
  }
);
